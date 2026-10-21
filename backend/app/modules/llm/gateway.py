import json
import time
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings
from app.core.logging import logger

class LLMResponse:
    def __init__(
        self,
        content: str,
        structured_data: Optional[Dict[str, Any]] = None,
        model_name: str = "mock-model",
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        cost_usd: float = 0.0,
        is_mock: bool = False
    ):
        self.content = content
        self.structured_data = structured_data
        self.model_name = model_name
        self.prompt_tokens = prompt_tokens
        self.completion_tokens = completion_tokens
        self.cost_usd = cost_usd
        self.is_mock = is_mock

class LLMGateway:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.gemini_key = settings.GEMINI_API_KEY
        self.model_name = settings.LLM_MODEL or "gemini-flash-latest"
        self.timeout = settings.LLM_REQUEST_TIMEOUT_SECONDS

    def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        schema_description: str
    ) -> LLMResponse:
        """
        Generates structured JSON response.
        Attempts Gemini API if key is present, otherwise falls back gracefully to deterministic Mock Provider.
        """
        if self.gemini_key and self.gemini_key.strip():
            try:
                return self._call_gemini(system_prompt, user_prompt, schema_description)
            except Exception as e:
                logger.warning(f"Gemini API call failed ({e}). Falling back to deterministic mock provider.")

        # Default Mock Provider
        return self._call_mock(user_prompt)

    def _call_gemini(self, system_prompt: str, user_prompt: str, schema_description: str) -> LLMResponse:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"
        
        full_prompt = (
            f"{system_prompt}\n\n"
            f"You MUST output valid, parseable JSON only conforming to this schema:\n"
            f"{schema_description}\n\n"
            f"Input:\n{user_prompt}\n\n"
            f"Output strictly valid JSON with no extra commentary or markdown backticks."
        )

        payload = {
            "contents": [
                {
                    "parts": [{"text": full_prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.gemini_key
        }

        with httpx.Client(timeout=self.timeout) as client:
            res = client.post(url, json=payload, headers=headers)
            res.raise_for_status()
            data = res.json()

        # Parse text from candidates
        candidates = data.get("candidates", [])
        if not candidates:
            raise ValueError("No candidates returned from Gemini API")

        raw_text = candidates[0]["content"]["parts"][0]["text"].strip()
        # Clean any accidental code block markers
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        parsed_json = json.loads(raw_text)
        usage = data.get("usageMetadata", {})
        prompt_tokens = usage.get("promptTokenCount", len(full_prompt) // 4)
        completion_tokens = usage.get("candidatesTokenCount", len(raw_text) // 4)

        return LLMResponse(
            content=raw_text,
            structured_data=parsed_json,
            model_name=self.model_name,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            cost_usd=round((prompt_tokens * 0.00000035) + (completion_tokens * 0.00000105), 6),
            is_mock=False
        )

    def _call_mock(self, user_prompt: str) -> LLMResponse:
        """Deterministic mock response for GxP CSV Copilot pilot demonstration."""
        mock_data = {
            "project_brief": (
                "End-to-End CSV Copilot for clinical dataset validation, "
                "missingness analysis, and ALCOA+ data integrity enforcement."
            ),
            "requirements": [
                {
                    "id": "REQ-CSV-001",
                    "title": "Clinical CSV File Format & Encoding Verification",
                    "description": "The system shall ingest UTF-8 and ASCII delimited CSV files up to 25MB and verify header row integrity.",
                    "type": "functional",
                    "priority": "high",
                    "acceptance_criteria": [
                        "Validates CSV mime type and parses comma/tab delimiters",
                        "Computes and verifies SHA-256 file checksum before ingestion",
                        "Rejects malformed files with row count and column index diagnostic"
                    ],
                    "source_reference": "GxP_Clinical_Protocol.pdf, Section 3.1 Data Acquisition"
                },
                {
                    "id": "REQ-CSV-002",
                    "title": "Mandatory Patient Identification Column Checks",
                    "description": "The system shall enforce presence of USUBJID (Unique Subject Identifier) and VISITNUM across clinical datasets.",
                    "type": "regulatory",
                    "priority": "critical",
                    "acceptance_criteria": [
                        "Flag missing USUBJID rows as severe compliance violations",
                        "Halt dataset promotion if subject identification rate < 100%"
                    ],
                    "source_reference": "21 CFR Part 11 Electronic Records, Subpart B §11.10"
                },
                {
                    "id": "REQ-CSV-003",
                    "title": "Statistical Missingness & Outlier Flagging Engine",
                    "description": "The system shall calculate missingness percentages per column and flag clinical lab value anomalies beyond 3 standard deviations.",
                    "type": "safety",
                    "priority": "high",
                    "acceptance_criteria": [
                        "Generate missingness summary table across all laboratory variables",
                        "Highlight out-of-range clinical vital signs in safety review report"
                    ],
                    "source_reference": "ALCOA+ Data Integrity Principles (Complete & Accurate)"
                },
                {
                    "id": "REQ-CSV-004",
                    "title": "Immutable Audit Trail & Evidence Hash Generation",
                    "description": "Every ingestion, extraction, and validation run must record an immutable timestamped event hash linked to the reviewer identity.",
                    "type": "regulatory",
                    "priority": "critical",
                    "acceptance_criteria": [
                        "Log operator ID, timestamp, and verification hash in audit collection",
                        "Disallow modification or deletion of past verification runs"
                    ],
                    "source_reference": "FDA Guidance for Industry: Computerized Systems in Clinical Investigations §IV"
                }
            ],
            "missing_information_questions": [
                "Are non-standard comma delimiters (e.g. pipe or semicolon) permitted for European sites?",
                "What is the maximum allowed missingness threshold before a site batch is rejected?"
            ]
        }

        return LLMResponse(
            content=json.dumps(mock_data, indent=2),
            structured_data=mock_data,
            model_name="mock-adlc-agent-v1",
            prompt_tokens=420,
            completion_tokens=580,
            cost_usd=0.0,
            is_mock=True
        )

llm_gateway = LLMGateway()
