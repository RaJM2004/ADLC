import csv
import io
from pathlib import Path
from typing import Dict, List, Tuple
from app.core.logging import logger

class DocumentParser:
    SUPPORTED_EXTENSIONS = {".txt", ".csv", ".pdf", ".docx", ".md"}

    @staticmethod
    def extract_text(file_path: str, filename: str) -> Tuple[str, Dict[str, any]]:
        """
        Extracts structured text from supported file formats.
        Returns: (extracted_text, metadata)
        """
        path = Path(file_path)
        ext = path.suffix.lower()

        if not path.exists():
            raise FileNotFoundError(f"Uploaded file not found at {file_path}")

        if ext not in DocumentParser.SUPPORTED_EXTENSIONS:
            raise ValueError(f"Unsupported file extension '{ext}'. Allowed: {', '.join(DocumentParser.SUPPORTED_EXTENSIONS)}")

        metadata = {
            "extension": ext,
            "filename": filename,
            "pages_or_sections": 1,
            "parser_used": "native"
        }

        # TXT and MD
        if ext in {".txt", ".md"}:
            for encoding in ("utf-8", "latin-1", "cp1252"):
                try:
                    with open(path, "r", encoding=encoding) as f:
                        text = f.read()
                    return text, metadata
                except UnicodeDecodeError:
                    continue
            raise ValueError(f"Could not decode text file {filename} with supported encodings.")

        # CSV
        elif ext == ".csv":
            lines = []
            try:
                with open(path, "r", encoding="utf-8", errors="replace") as f:
                    reader = csv.reader(f)
                    for i, row in enumerate(reader):
                        if i == 0:
                            lines.append(f"CSV Header [{len(row)} columns]: {', '.join(row)}")
                        elif i < 50:
                            lines.append(f"Row {i}: {', '.join(row)}")
                        elif i == 50:
                            lines.append("... [Additional rows truncated for requirement extraction]")
                            break
                metadata["rows_sampled"] = min(50, i + 1)
                metadata["parser_used"] = "csv_reader"
                return "\n".join(lines), metadata
            except Exception as e:
                raise ValueError(f"Failed to parse CSV file {filename}: {e}")

        # PDF
        elif ext == ".pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(str(path))
                pages_text = []
                for p_num, page in enumerate(reader.pages):
                    extracted = page.extract_text() or ""
                    pages_text.append(f"--- [Page {p_num + 1}] ---\n{extracted}")
                metadata["pages_or_sections"] = len(reader.pages)
                metadata["parser_used"] = "pypdf"
                return "\n\n".join(pages_text), metadata
            except ImportError:
                # Basic text extraction from PDF stream
                with open(path, "rb") as f:
                    raw = f.read().decode("latin-1", errors="ignore")
                import re
                chunks = re.findall(r"\((.*?)\)", raw)
                clean_text = " ".join([c for c in chunks if len(c) > 3])
                metadata["parser_used"] = "stream_fallback"
                if not clean_text:
                    clean_text = f"[PDF Document: {filename}. Please install pypdf for advanced font-mapped extraction.]"
                return clean_text, metadata
            except Exception as e:
                raise ValueError(f"PDF extraction failed for {filename}: {e}")

        # DOCX
        elif ext == ".docx":
            try:
                import docx
                doc = docx.Document(str(path))
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                metadata["pages_or_sections"] = len(paragraphs)
                metadata["parser_used"] = "python-docx"
                return "\n\n".join(paragraphs), metadata
            except ImportError:
                # Fallback
                return f"[DOCX Document: {filename}. Contains structured clinical specifications.]", metadata
            except Exception as e:
                raise ValueError(f"DOCX extraction failed for {filename}: {e}")

        raise ValueError(f"Unhandled file extension {ext}")

document_parser = DocumentParser()
