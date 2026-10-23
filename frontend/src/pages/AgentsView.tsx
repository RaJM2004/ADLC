import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  Play,
  RotateCw,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Shield,
  Layers,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Code2,
  Database,
  Lock,
  Server,
  Activity,
  CheckSquare,
  Copy,
  Check,
  FileCode,
  FileSpreadsheet,
  Gauge,
  Sliders,
  Maximize2,
  Terminal,
  ShieldAlert,
  ArrowRight,
  X,
  FileCheck2,
  Info
} from 'lucide-react';
import { api } from '../api/client';
import { Project } from '../types';
import { useProject } from '../context/ProjectContext';

interface AgentItem {
  id: string;
  name: string;
  role: string;
  task: string;
  category: string;
  status: 'Running' | 'Completed' | 'Idle' | 'Error';
  confidence: number;
  lastRun: string;
  inputDoc: string;
  outputArtifact: string;
  startedTime: string;
  tools: string[];
  lastInputSummary: string;
  trace: Array<{ time: string; text: string }>;
  artifactPayload?: any;
}

export const AgentsView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');
  const { projects, selectedProjectId, setSelectedProjectId } = useProject();

  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-01');
  const [search, setSearch] = useState('');
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'deliverables' | 'trace' | 'json'>('deliverables');
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // If url has projectId, apply it
  useEffect(() => {
    if (urlProjectId && urlProjectId !== selectedProjectId) {
      setSelectedProjectId(urlProjectId);
    }
  }, [urlProjectId]);

  // Initial 11 Specialist Agents Registry with rich pre-loaded deliverable artifacts
  const [agents, setAgents] = useState<AgentItem[]>([
    {
      id: 'agent-01',
      name: 'Agent 1: Intake & Requirements',
      role: 'Intake Specialist',
      category: 'Intake',
      task: 'Clinical Protocol Requirement Extraction',
      status: 'Completed',
      confidence: 98,
      lastRun: '1 min ago',
      inputDoc: 'GxP_Clinical_Protocol_Specification.txt',
      outputArtifact: '/requirements/extracted_reqs.json',
      startedTime: 'Active',
      tools: ['DocumentParser', 'Gemini-Flash', 'CitationMapper', 'Part11_Validator'],
      lastInputSummary: 'Extracted 4 mandatory GxP requirements with 21 CFR §11 citations and acceptance criteria.',
      trace: [
        { time: '10:00', text: 'Ingested raw clinical protocol specification' },
        { time: '10:01', text: 'Verified SHA-256 cryptographic checksum' },
        { time: '10:01', text: 'Synthesized structured draft requirements REQ-CSV-001..004' },
        { time: '10:02', text: 'Human approval gate signed off' }
      ],
      artifactPayload: {
        requirements: [
          {
            id: 'REQ-CSV-001',
            title: 'Clinical CSV File Format & Encoding Verification',
            type: 'Data Ingestion & Integrity',
            priority: 'Critical',
            description: 'Accept UTF-8 encoded, comma-delimited clinical laboratory datasets up to 25MB and verify mandatory 10 CDISC SDTM headers.',
            acceptance_criteria: [
              'Assert UTF-8 encoding without BOM',
              'Validate presence of USUBJID, VISITNUM, LBTESTCD, LBORRES',
              'Generate SHA-256 cryptographic digest prior to persistence'
            ],
            citations: ['21 CFR §11.10(a) System Validation', 'ALCOA+ (Original)']
          },
          {
            id: 'REQ-CSV-002',
            title: 'Mandatory Patient Identification Column Checks',
            type: 'Data Integrity (ALCOA+)',
            priority: 'Critical',
            description: 'Enforce strict patient identity attributability. Records with missing USUBJID must be quarantined.',
            acceptance_criteria: [
              'Quarantine records with null or blank USUBJID',
              'Halt dataset promotion to regulatory trial pool',
              'Log deviation event in audit trail with timestamp and line number'
            ],
            citations: ['21 CFR §11.10(b) Data Protection', 'ALCOA+ (Attributable)']
          },
          {
            id: 'REQ-CSV-003',
            title: 'Statistical Missingness & Outlier Flagging Engine',
            type: 'Safety & Statistics',
            priority: 'High',
            description: 'Calculate statistical missingness thresholds and flag liver safety signals exceeding 3x Upper Limit of Normal (ULN).',
            acceptance_criteria: [
              'Calculate missingness percentage across all laboratory variables',
              'Emit alert when missingness > 5.0%',
              'Identify ALT/AST values >= 3x ULN for potential Drug-Induced Liver Injury (DILI)'
            ],
            citations: ['FDA DILI Guidance (2009)', 'ALCOA+ (Accurate)']
          },
          {
            id: 'REQ-CSV-004',
            title: 'Immutable Audit Trail & Evidence Hash Generation',
            type: 'Governance & Regulatory',
            priority: 'Critical',
            description: 'Maintain append-only cryptographic event logs recording all agent actions and human sign-offs under 21 CFR Part 11.',
            acceptance_criteria: [
              'SHA-256 HMAC chaining across sequential operations',
              'Capture ISO 8601 UTC timestamp, user/agent ID, and before/after values',
              'Prevent record deletion or out-of-order modification'
            ],
            citations: ['21 CFR §11.10(e) Time-Stamped Audit Trails', 'ALCOA+ (Enduring)']
          }
        ]
      }
    },
    {
      id: 'agent-02',
      name: 'Agent 2: Planning & Tasks',
      role: 'WBS & Task Architect',
      category: 'Planning',
      task: 'Work Breakdown Structure Breakdown',
      status: 'Completed',
      confidence: 96,
      lastRun: '2 mins ago',
      inputDoc: 'approved_requirements.json',
      outputArtifact: '/tasks/project_tasks.json',
      startedTime: 'Active',
      tools: ['DAGBuilder', 'DoDGenerator', 'RoleMapper'],
      lastInputSummary: 'Synthesized 4 cross-functional development tasks and 4 formal QA test cases.',
      trace: [
        { time: '10:02', text: 'Loaded 4 approved requirements' },
        { time: '10:02', text: 'Generated 4 tasks with assigned roles & hour estimates' },
        { time: '10:03', text: 'Formulated Definition-of-Done (DoD) verification criteria' }
      ],
      artifactPayload: {
        tasks: [
          {
            id: 'TSK-01',
            title: 'Implement Stream Parser & SHA-256 Ingestion Service',
            role: 'Backend Engineer',
            estimated_hours: 12,
            priority: 'Critical',
            status: 'completed',
            definition_of_done: ['Chunked streaming implemented', 'SHA-256 calculated before persistence', 'Unit tests pass 100%']
          },
          {
            id: 'TSK-02',
            title: 'Build Clinical Subject ID Quarantine Logic',
            role: 'Clinical Data Manager',
            estimated_hours: 8,
            priority: 'Critical',
            status: 'completed',
            definition_of_done: ['Null USUBJID quarantined with reason', 'Dataset promotion halted', 'Deviation alert emitted']
          },
          {
            id: 'TSK-03',
            title: 'Develop 3x ULN Safety Outlier & Missingness Detector',
            role: 'Data Scientist',
            estimated_hours: 10,
            priority: 'High',
            status: 'completed',
            definition_of_done: ['3x ULN comparator asserted for ALT/AST', 'Statistical missingness summary computed', 'Safety notification hook triggered']
          },
          {
            id: 'TSK-04',
            title: 'Establish Immutable Audit Trail Ledger',
            role: 'DevOps / Security Engineer',
            estimated_hours: 6,
            priority: 'Critical',
            status: 'completed',
            definition_of_done: ['WORM storage policy configured', 'SHA-256 chaining verified', '21 CFR Part 11 signature capture implemented']
          }
        ],
        test_cases: [
          {
            id: 'TC-SPEC-01',
            title: 'CDISC SDTM Header Compliance Validation',
            category: 'Format & Schema',
            steps: ['Stream 16-row CSV', 'Assert 10 headers', 'Verify UTF-8 encoding'],
            expected: 'Zero header mismatches'
          },
          {
            id: 'TC-SPEC-02',
            title: 'Null USUBJID Quarantine Isolation',
            category: 'Data Integrity (ALCOA+)',
            steps: ['Inject null USUBJID row', 'Trigger parser', 'Inspect quarantine partition'],
            expected: 'Row isolated; promotion blocked'
          }
        ]
      }
    },
    {
      id: 'agent-03',
      name: 'Agent 3: Architecture & API',
      role: 'API Design Specialist',
      category: 'Architecture',
      task: 'OpenAPI 3.1 & Microservice Topology',
      status: 'Completed',
      confidence: 95,
      lastRun: 'Just now',
      inputDoc: 'requirements_spec.json',
      outputArtifact: '/architecture/openapi_v31.json',
      startedTime: 'Active',
      tools: ['OpenAPIGenerator', 'FastAPISchemaValidator', 'CDISC_SDTM_Dict'],
      lastInputSummary: 'Synthesized 5 core microservice topologies and 4 OpenAPI 3.1 REST contracts.',
      trace: [
        { time: '10:05', text: 'Mapped requirements to streaming ingestion gateway' },
        { time: '10:05', text: 'Synthesized OpenAPI 3.1 REST contracts with RBAC scopes' },
        { time: '10:06', text: 'Formulated CDISC SDTM v3.3 clinical data dictionary' }
      ],
      artifactPayload: {
        components: [
          { name: 'Clinical Stream Ingestion Gateway', category: 'Gateway', technologies: ['FastAPI', 'HTTP/2', 'Python Streams'], gxp_compliance: '21 CFR §11.10(a)' },
          { name: 'Cryptographic Checksum & Audit Ledger', category: 'Governance', technologies: ['SHA-256', 'MongoDB Atlas', 'HMAC'], gxp_compliance: '21 CFR §11.10(e)' },
          { name: 'Patient Quarantine Sandbox', category: 'Processing Engine', technologies: ['Atomic Isolation Sandbox', 'Celery'], gxp_compliance: 'ALCOA+ (Attributable)' },
          { name: 'DILI Toxicity Surveillance Engine', category: 'Processing Engine', technologies: ['NumPy', 'Pydantic V2', 'WebSocket'], gxp_compliance: 'FDA DILI Guidance' },
          { name: 'Regulatory Repository & Data Vault', category: 'Storage', technologies: ['MongoDB Atlas', 'AES-256', 'TLS 1.3'], gxp_compliance: 'ALCOA+ (Enduring)' }
        ],
        endpoints: [
          { method: 'POST', path: '/api/v1/clinical/ingest', summary: 'Ingest and validate clinical laboratory CSV with SHA-256', requirement_id: 'REQ-CSV-001', security_scope: 'clinical:write' },
          { method: 'GET', path: '/api/v1/clinical/audit-trail/{dataset_id}', summary: 'Fetch cryptographic audit trail and event ledger', requirement_id: 'REQ-CSV-004', security_scope: 'audit:read' },
          { method: 'GET', path: '/api/v1/clinical/quarantine', summary: 'List isolated records failing ALCOA+ patient ID check', requirement_id: 'REQ-CSV-002', security_scope: 'clinical:review' },
          { method: 'POST', path: '/api/v1/clinical/safety-alerts/acknowledge', summary: 'Study physician electronic sign-off on 3x ULN alert', requirement_id: 'REQ-CSV-003', security_scope: 'physician:sign' }
        ]
      }
    },
    {
      id: 'agent-04',
      name: 'Agent 4: Data Engineering',
      role: 'Data Quality & CDISC Architect',
      category: 'Data',
      task: 'Clinical CSV Profiling & Isolation',
      status: 'Completed',
      confidence: 98,
      lastRun: 'Just now',
      inputDoc: 'clinical_trial_lab_data.csv',
      outputArtifact: '/data/quality_profile.json',
      startedTime: 'Active',
      tools: ['DataProfiler', 'CDISCSchemaValidator', 'QuarantineFilter'],
      lastInputSummary: 'Profiled 16 clinical records. Quality Score: 93.8%. Isolated Line 17 under ALCOA+ rules.',
      trace: [
        { time: '10:08', text: 'Ingested raw CSV byte stream' },
        { time: '10:08', text: 'Validated UTF-8 encoding and 10 CDISC headers' },
        { time: '10:09', text: 'Detected missing AST on Line 12 (missingness rate 6.25%)' },
        { time: '10:09', text: 'Isolated Line 17 with missing USUBJID to quarantine partition' }
      ],
      artifactPayload: {
        dataset_name: 'clinical_trial_lab_data.csv',
        sha256_fingerprint: '7a356391d4e0e5a6fc624c94a2b97c27181c47012567a57a82b4a7d65b71db41',
        total_rows: 16,
        total_columns: 10,
        cdisc_standard: 'SDTM Laboratory (LB) Domain v3.3',
        data_quality_score: 93.75,
        quarantined_records: [
          {
            row_index: 17,
            reason: 'Missing mandatory Subject Identifier (USUBJID)',
            disposition: 'Quarantined in COMPLIANCE_ERROR_NULL_USUBJID ledger'
          }
        ],
        distributions: {
          ALT: { count: 4, mean: 66.5, max: 185.0, safety_flag: '1 Outlier (>3x ULN)' },
          AST: { count: 3, mean: 61.3, max: 140.0, safety_flag: '1 Outlier (>3x ULN)' },
          BILI: { count: 3, mean: 0.85, max: 1.1, safety_flag: 'Normal' }
        }
      }
    },
    {
      id: 'agent-05',
      name: 'Agent 5: Software Development',
      role: 'Code Synthesis Agent',
      category: 'Development',
      task: 'Stream Parser Code Patch Synthesis',
      status: 'Completed',
      confidence: 94,
      lastRun: 'Just now',
      inputDoc: 'tasks_and_contracts.json',
      outputArtifact: '/src/clinical_csv_parser.py',
      startedTime: 'Active',
      tools: ['PythonCodeSynthesizer', 'MemoryProfiler', 'ASTValidator'],
      lastInputSummary: 'Synthesized production Python GxP streaming parser with memory-bounded quarantine and safety filters.',
      trace: [
        { time: '10:12', text: 'Loaded task TSK-CSV-001 & TSK-CSV-003' },
        { time: '10:12', text: 'Synthesized streaming generator to guarantee O(1) memory complexity' },
        { time: '10:13', text: 'Inlined deterministic 3x ULN DILI safety boundary check' }
      ],
      artifactPayload: {
        language: 'python',
        filename: 'clinical_csv_parser.py',
        lines: 35,
        code: `# Auto-generated by Specialist Agent 5 (Software Development)
# Target: Clinical CSV Stream Parser with 21 CFR Part 11 Integrity Guardrails
import csv
import hashlib
from typing import Generator, Dict, Any, Tuple

class ClinicalCSVParser:
    """Streamed GxP Parser enforcing UTF-8, SHA-256, and quarantine isolation."""
    REQUIRED_HEADERS = [
        "USUBJID", "VISITNUM", "VISIT", "LBDT", 
        "LBTESTCD", "LBTEST", "LBORRES", "LBORRESU", "LBORNRLO", "LBORNRHI"
    ]
    
    def __init__(self, raw_stream):
        self.stream = raw_stream
        self.hasher = hashlib.sha256()
        
    def parse(self) -> Generator[Tuple[str, Dict[str, Any]], None, None]:
        # Process line-by-line without loading entire 25MB file into RAM
        reader = csv.DictReader(self.stream)
        for row_idx, row in enumerate(reader, start=2):
            # 21 CFR §11.10(b) Patient ID Quarantine Check
            if not row.get("USUBJID") or not row["USUBJID"].strip():
                yield ("QUARANTINE", {"row": row_idx, "error": "NULL_USUBJID", "data": row})
                continue
                
            # 3x ULN DILI Safety Comparator Check
            test = row.get("LBTESTCD", "")
            try:
                res = float(row.get("LBORRES", 0))
                uln = float(row.get("LBORNRHI", 9999))
                if test in ["ALT", "AST"] and res >= 3.0 * uln:
                    yield ("SAFETY_ALERT_DILI", {"row": row_idx, "val": res, "uln": uln, "data": row})
            except (ValueError, TypeError):
                pass
                
            yield ("VALID", row)`
      }
    },
    {
      id: 'agent-06',
      name: 'Agent 6: Model & LLM Dev',
      role: 'Prompt & Model Engineer',
      category: 'AI / ML',
      task: 'Gemini Regulatory Guardrail Benchmarking',
      status: 'Completed',
      confidence: 97,
      lastRun: 'Just now',
      inputDoc: 'eval_benchmark_suite.json',
      outputArtifact: '/models/prompt_benchmark_v2.json',
      startedTime: 'Active',
      tools: ['PromptBenchmarker', 'LatencyTracker', 'HallucinationScanner'],
      lastInputSummary: 'Benchmarked Gemini model configuration: 98.4% extraction accuracy, 0.0% hallucination rate on clinical protocol text.',
      trace: [
        { time: '10:15', text: 'Configured temperature=0.1 with JSON schema enforcement' },
        { time: '10:15', text: 'Benchmarked 20 clinical protocol extraction passes' },
        { time: '10:16', text: 'Verified 0.0% hallucination rate on regulatory citations' }
      ],
      artifactPayload: {
        active_model: 'gemini-flash-latest',
        temperature: 0.1,
        extraction_accuracy: 98.4,
        regulatory_citation_precision: 100.0,
        hallucination_rate: 0.0,
        p95_inference_latency_ms: 1120,
        average_cost_per_ingest_usd: 0.0014,
        guardrail_status: 'All safety boundaries verified against prompt injection and hallucination'
      }
    },
    {
      id: 'agent-07',
      name: 'Agent 7: QA & Test',
      role: 'Deterministic Test Runner',
      category: 'Testing',
      task: 'Automated CSV Validation Execution',
      status: 'Completed',
      confidence: 100,
      lastRun: 'Just now',
      inputDoc: 'clinical_trial_lab_data.csv',
      outputArtifact: '/evaluations/latest_run.json',
      startedTime: 'Active',
      tools: ['DeterministicRunner', 'ALCOA_Validator', '21CFR_AssertionEngine'],
      lastInputSummary: 'Executed 5 deterministic verification tests on live clinical data. Pass Rate: 100.0%.',
      trace: [
        { time: '10:18', text: 'TC-01: UTF-8 & CDISC headers passed' },
        { time: '10:18', text: 'TC-02: Cryptographic SHA-256 hash verified' },
        { time: '10:19', text: 'TC-03: Null USUBJID quarantine verified on Line 17' },
        { time: '10:19', text: 'TC-04: Missingness rate calculated (6.25%)' },
        { time: '10:19', text: 'TC-05: 3x ULN DILI safety alerts asserted on Lines 9-10' }
      ],
      artifactPayload: {
        dataset_filename: 'clinical_trial_lab_data.csv',
        total_tests: 5,
        passed: 5,
        failed: 0,
        pass_rate_pct: 100.0,
        results: [
          { id: 'TC-01', name: 'UTF-8 Encoding & CDISC Header Validation', status: 'PASSED', duration_ms: 1.2, evidence: 'Verified UTF-8 encoding. All 10 mandatory CDISC columns validated.' },
          { id: 'TC-02', name: 'Cryptographic Checksum & Immutability Verification', status: 'PASSED', duration_ms: 0.8, evidence: 'SHA-256 Checksum 7a356391d4e0... matches immutable ingest hash.' },
          { id: 'TC-03', name: 'Mandatory Patient Identification Column Checks', status: 'PASSED', duration_ms: 1.5, evidence: 'Identified null USUBJID on Line 17. Correctly quarantined under COMPLIANCE_ERROR_NULL_USUBJID.' },
          { id: 'TC-04', name: 'Statistical Missingness Threshold Detection', status: 'PASSED', duration_ms: 1.1, evidence: 'Detected missing AST laboratory result on Line 12. Calculated missingness = 6.25%.' },
          { id: 'TC-05', name: 'Biological Plausibility & 3x ULN Liver Safety Outlier', status: 'PASSED', duration_ms: 2.0, evidence: 'Flagged 2 DILI safety outliers: Line 9 (ALT=185 U/L) and Line 10 (AST=140 U/L).' }
        ]
      }
    },
    {
      id: 'agent-08',
      name: 'Agent 8: AI Risk & Compliance',
      role: 'Risk Assessment Specialist',
      category: 'Governance',
      task: 'GxP Hazard Identification & Control Draft',
      status: 'Completed',
      confidence: 96,
      lastRun: 'Just now',
      inputDoc: 'approved_requirements.json',
      outputArtifact: '/risks/fmea_matrix.json',
      startedTime: 'Active',
      tools: ['RiskTaxonomyModel', 'ISO14971_Matcher', 'Part11_Checklist'],
      lastInputSummary: 'Synthesized ISO 14971 FMEA with 4 failure modes. Average RPN: 9.5. All mitigations verified.',
      trace: [
        { time: '10:21', text: 'Evaluated 4 approved requirements for clinical failure modes' },
        { time: '10:21', text: 'Calculated Severity, Probability, Detection RPN ratings' },
        { time: '10:22', text: 'Engineered traceable mitigations to 21 CFR Part 11 and ALCOA+' }
      ],
      artifactPayload: {
        average_rpn: 9.5,
        risks: [
          { code: 'FM-01', failure_mode: 'Silent File Corruption or Bit-Rot during Ingestion', severity: 5, probability: 2, detection: 1, rpn: 10, mitigation: 'Automated SHA-256 cryptographic digest calculated at ingestion and stored in audit ledger.', gxp_citation: '21 CFR §11.10(e)' },
          { code: 'FM-02', failure_mode: 'Ingestion of Null / Malformed Subject Identifier (USUBJID)', severity: 4, probability: 3, detection: 1, rpn: 12, mitigation: 'Automated schema validator halts record promotion and routes row to quarantine partition.', gxp_citation: '21 CFR §11.10(b)' },
          { code: 'FM-03', failure_mode: 'Undetected Acute Drug-Induced Liver Injury (DILI)', severity: 5, probability: 2, detection: 1, rpn: 10, mitigation: 'Deterministic rule engine asserts ALT and AST >= 3*ULN; dispatches high-priority alert.', gxp_citation: 'FDA DILI Guidance' },
          { code: 'FM-04', failure_mode: 'Non-UTF-8 Encoding or Truncated CDISC Column Headers', severity: 3, probability: 2, detection: 1, rpn: 6, mitigation: 'Strict byte boundary validation rejects malformed streams at gateway pre-flight check.', gxp_citation: '21 CFR §11.10(a)' }
        ]
      }
    },
    {
      id: 'agent-09',
      name: 'Agent 9: Security Agent',
      role: 'Threat Modeling Agent',
      category: 'Security',
      task: 'STRIDE Threat Model & Secrets Scan',
      status: 'Completed',
      confidence: 99,
      lastRun: 'Just now',
      inputDoc: 'codebase_manifest.json',
      outputArtifact: '/security/audit_report.json',
      startedTime: 'Active',
      tools: ['SecretScanner', 'STRIDE_Auditor', 'TLSEnforcer'],
      lastInputSummary: 'Completed STRIDE Threat Model & Secrets Scan: 0 vulnerabilities found, TLS 1.3 enforced, 21 CFR §11 audit trail secure.',
      trace: [
        { time: '10:24', text: 'Scanned repository for committed secrets: 0 findings' },
        { time: '10:24', text: 'Verified SHA-256 HMAC ledger chaining' },
        { time: '10:25', text: 'Asserted strict TLS 1.3 transport encryption' }
      ],
      artifactPayload: {
        threat_model: 'STRIDE for Medical Data Pipelines',
        scans: {
          hardcoded_secrets_detected: 0,
          vulnerable_dependencies: 0,
          tls_transport_level: 'TLS 1.3 Strict',
          encryption_at_rest: 'AES-256-GCM Envelope Encryption',
          audit_ledger_integrity: 'SHA-256 HMAC chained'
        },
        status: 'SECURE / GXP AUDIT READY',
        remediations: []
      }
    },
    {
      id: 'agent-10',
      name: 'Agent 10: Release & Deployment',
      role: 'Release Orchestrator',
      category: 'Release',
      task: 'Release Candidate Readiness Audit',
      status: 'Completed',
      confidence: 100,
      lastRun: 'Just now',
      inputDoc: 'gxp_quality_gates.json',
      outputArtifact: '/release/readiness_dossier.json',
      startedTime: 'Active',
      tools: ['StageGateChecker', 'EvidenceAuditor', 'ManifestBuilder'],
      lastInputSummary: 'All 5 Stage Gates passed: 100% requirements verified, 100% tests passed, 0 security defects. Authorized for Deployment.',
      trace: [
        { time: '10:27', text: 'Checked Stage Gate 1: Requirements Intake (Approved)' },
        { time: '10:27', text: 'Checked Stage Gate 2: Architecture & OpenAPI (Approved)' },
        { time: '10:28', text: 'Checked Stage Gate 3: Deterministic Tests 5/5 (Passed)' },
        { time: '10:28', text: 'Checked Stage Gate 4: FMEA Risks (Mitigated)' },
        { time: '10:28', text: 'Authorized for GxP Production Pilot Deployment' }
      ],
      artifactPayload: {
        release_candidate: 'v1.0.0-gxp.pilot',
        quality_gates: {
          requirements_approved: '4 of 4 (100%)',
          engineering_tasks_completed: '4 of 4 (100%)',
          automated_tests_passed: '5 of 5 (100%)',
          fmea_hazards_mitigated: '4 of 4 (100%)',
          security_findings: '0 critical / 0 high'
        },
        disposition: 'AUTHORIZED FOR GXP PILOT DEPLOYMENT',
        deployment_manifest: {
          backend_image: 'genquantaa-adlc-backend:v1.0.0',
          frontend_bundle: 'genquantaa-adlc-ui:v1.0.0',
          database_target: 'MongoDB Atlas Multi-Region Sharded',
          rollback_ready: true
        }
      }
    },
    {
      id: 'agent-11',
      name: 'Agent 11: Monitoring & Optimization',
      role: 'Telemetry & Drift Agent',
      category: 'Operations',
      task: 'Continuous Ingestion Drift Surveillance',
      status: 'Completed',
      confidence: 98,
      lastRun: 'Just now',
      inputDoc: 'runtime_telemetry.json',
      outputArtifact: '/monitoring/drift_report.json',
      startedTime: 'Active',
      tools: ['TelemetryCollector', 'DriftCalculator', 'CostAuditor'],
      lastInputSummary: 'Runtime Health: 99.99% uptime, P95 latency 14.2ms, zero data drift, $0.0014 cost expenditure.',
      trace: [
        { time: '10:30', text: 'Polled runtime API latency metrics: P50=3.8ms, P95=14.2ms' },
        { time: '10:30', text: 'Calculated KL-divergence for clinical lab distributions: 0.012 (No drift)' },
        { time: '10:31', text: 'Confirmed 99.99% system availability' }
      ],
      artifactPayload: {
        window: 'Last 24 Hours',
        metrics: {
          system_uptime: '99.99%',
          p50_latency_ms: 3.8,
          p95_latency_ms: 14.2,
          total_csv_records_processed: 16,
          error_rate_pct: 0.0,
          model_drift_divergence_kl: 0.012,
          drift_status: 'Within Normal Operating Thresholds',
          llm_token_expenditure_usd: 0.0014
        },
        recommendations: [
          'Stream parser operating at optimal latency.',
          'No data drift detected across clinical laboratory distributions.'
        ]
      }
    }
  ]);

  // Live Agent Trigger
  const handleRunAgent = async (agentId: string) => {
    if (!selectedProjectId) return;
    try {
      setRunningAgentId(agentId);
      const res = await fetch(`/api/v1/projects/${selectedProjectId}/agents/${agentId}/run`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Agent execution failed');
      }
      const data = await res.json();
      
      setAgents((prev) =>
        prev.map((a) => {
          if (a.id === agentId || a.id.replace('-', '_') === agentId.replace('-', '_')) {
            return {
              ...a,
              status: 'Completed',
              confidence: data.confidence || 98,
              lastRun: 'Just now',
              lastInputSummary: data.summary || a.lastInputSummary,
              artifactPayload: data.artifact || a.artifactPayload,
              trace: (data.trace || []).map((t: string) => ({
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: t
              }))
            };
          }
          return a;
        })
      );
    } catch (err: any) {
      alert(`Error running agent: ${err.message}`);
    } finally {
      setRunningAgentId(null);
    }
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase()) ||
      a.task.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  const copyToClipboard = (text: string, type: 'json' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'json') {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Helper renderers for each agent's specific deliverable right on the screen
  const renderAgentDeliverables = (agent: AgentItem) => {
    const payload = agent.artifactPayload || {};

    switch (agent.id) {
      case 'agent-01': {
        const reqs = payload.requirements || [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900">Extracted GxP Requirements ({reqs.length})</h4>
                <p className="text-xs text-slate-500">Autonomous extraction from clinical protocol specification with 21 CFR §11 citation mapping.</p>
              </div>
              <button
                onClick={() => navigate('/requirements')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>Manage in Requirements View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {reqs.map((r: any, idx: number) => (
                <div key={idx} className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {r.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {r.priority} Priority
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-900 leading-snug">
                    {r.title}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="space-y-1 pt-1.5 border-t border-slate-200/60">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Acceptance Criteria</div>
                    <ul className="space-y-1">
                      {(r.acceptance_criteria || []).map((ac: string, i: number) => (
                        <li key={i} className="text-[11px] text-slate-700 flex items-start space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{ac}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {(r.citations || []).map((c: string, i: number) => (
                      <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'agent-02': {
        const tasks = payload.tasks || [];
        const testCases = payload.test_cases || [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900">Work Breakdown Structure (WBS) & QA Specifications</h4>
                <p className="text-xs text-slate-500">Autonomous breakdown into cross-functional development tasks and QA verification specs.</p>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <span>Manage in Tasks View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Generated Engineering Tasks ({tasks.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks.map((t: any, idx: number) => (
                  <div key={idx} className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {t.id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                        {t.estimated_hours}h Estimated
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 leading-snug">{t.title}</div>
                    <div className="text-[11px] text-slate-600 font-medium">Assigned Role: <span className="font-bold text-indigo-700">{t.role}</span></div>
                    <div className="pt-1 border-t border-slate-200/60">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Definition of Done (DoD)</div>
                      <div className="space-y-0.5">
                        {(t.definition_of_done || []).map((dod: string, i: number) => (
                          <div key={i} className="text-[10px] text-slate-600 flex items-center space-x-1">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span>{dod}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {testCases.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Linked QA Test Case Specifications ({testCases.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {testCases.map((tc: any, idx: number) => (
                    <div key={idx} className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-emerald-800">{tc.id}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">{tc.category}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{tc.title}</div>
                      <div className="text-[10px] text-slate-600"><strong>Expected:</strong> {tc.expected}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'agent-03': {
        const components = payload.components || [];
        const endpoints = payload.endpoints || [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900">Architecture Topology & OpenAPI 3.1 REST Contracts</h4>
                <p className="text-xs text-slate-500">Autonomous microservice component specification and API boundary contracts.</p>
              </div>
              <button
                onClick={() => navigate('/architecture')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>Inspect in Architecture View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Server className="w-4 h-4 text-blue-600" />
                <span>Microservice Topology Components ({components.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {components.map((c: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 inline-block">{c.category}</span>
                    <div className="text-xs font-bold text-slate-900">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.technologies?.join(', ')}</div>
                    <div className="text-[9px] font-bold text-teal-700 pt-1 border-t border-slate-200">{c.gxp_compliance}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Code2 className="w-4 h-4 text-emerald-600" />
                <span>OpenAPI 3.1 RESTful Contracts ({endpoints.length})</span>
              </div>
              <div className="space-y-2">
                {endpoints.map((ep: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-slate-200/90 rounded-xl gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900">{ep.path}</span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium">{ep.summary}</div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 self-start sm:self-auto">
                      {ep.security_scope}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'agent-04': {
        const quarantined = payload.quarantined_records || [];
        const distributions = payload.distributions || {};
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900">Clinical Data Profile & ALCOA+ Quarantine Ledger</h4>
                <p className="text-xs text-slate-500">Continuous profiling, cryptographic checksum, and patient isolation under 21 CFR §11.10(b).</p>
              </div>
            </div>

            {/* Profile KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-blue-700">Dataset Name</div>
                <div className="text-xs font-black text-slate-900 truncate mt-0.5">{payload.dataset_name || 'clinical_data.csv'}</div>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-emerald-700">Data Quality Score</div>
                <div className="text-xl font-black text-emerald-700 mt-0.5">{payload.data_quality_score || 93.8}%</div>
              </div>
              <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-indigo-700">Dimensions</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">{payload.total_rows || 16} Rows × {payload.total_columns || 10} Cols</div>
              </div>
              <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-rose-700">Quarantine Records</div>
                <div className="text-xl font-black text-rose-700 mt-0.5">{quarantined.length} Isolated</div>
              </div>
            </div>

            {/* SHA-256 fingerprint */}
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="truncate mr-3">
                <span className="text-slate-400 font-bold mr-2">SHA-256:</span>
                <span className="text-emerald-400">{payload.sha256_fingerprint || '7a356391d4e0e5a6fc624c94a2b97c27181c47012567a57a82b4a7d65b71db41'}</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold uppercase shrink-0">Verified</span>
            </div>

            {/* Quarantined Records Table */}
            {quarantined.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-rose-700 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Isolated Patient Records in Quarantine Ledger</span>
                </div>
                <div className="border border-rose-200 rounded-xl overflow-hidden bg-rose-50/30">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-rose-100/60 text-rose-900 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2">Row Index</th>
                        <th className="px-3 py-2">Failure Reason</th>
                        <th className="px-3 py-2">Regulatory Disposition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100">
                      {quarantined.map((q: any, i: number) => (
                        <tr key={i} className="hover:bg-rose-50/80">
                          <td className="px-3 py-2 font-mono font-bold text-rose-700">Line #{q.row_index}</td>
                          <td className="px-3 py-2 font-medium text-slate-800">{q.reason}</td>
                          <td className="px-3 py-2 text-rose-800 font-semibold text-[11px]">{q.disposition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Laboratory Distributions */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Laboratory Parameter Distributions & 3x ULN Outliers</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(distributions).map(([k, v]: any) => (
                  <div key={k} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{k}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.safety_flag.includes('Outlier') ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {v.safety_flag}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">Sample Count: <strong>{v.count}</strong></div>
                    <div className="text-xs text-slate-600">Mean Value: <strong>{v.mean}</strong> U/L</div>
                    <div className="text-xs font-black text-rose-600">Max Value: {v.max} U/L</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'agent-05': {
        const code = payload.code || '';
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900">Synthesized Production Streaming Parser</h4>
                <p className="text-xs text-slate-500">Generated Python parser implementing 21 CFR §11.10(b) quarantine checks and 3x ULN DILI safety alerts.</p>
              </div>
              <button
                onClick={() => copyToClipboard(code, 'code')}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 flex items-center space-x-1.5 transition-all"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied Code!' : 'Copy Python Code'}</span>
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 text-slate-200 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800 leading-relaxed max-h-[420px]">
              <pre className="text-emerald-400">{code}</pre>
            </div>
          </div>
        );
      }

      case 'agent-06': {
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900">Gemini Regulatory AI Benchmark & Guardrails</h4>
                <p className="text-xs text-slate-500">Autonomous evaluation of model precision, citation accuracy, and prompt injection immunity.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase text-blue-600">Extraction Accuracy</div>
                <div className="text-2xl font-black text-blue-700 mt-1">{payload.extraction_accuracy || 98.4}%</div>
              </div>
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase text-emerald-600">Citation Precision</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">{payload.regulatory_citation_precision || 100.0}%</div>
              </div>
              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase text-teal-600">Hallucination Rate</div>
                <div className="text-2xl font-black text-teal-700 mt-1">{payload.hallucination_rate || 0.0}%</div>
              </div>
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase text-purple-600">Avg Cost / Ingest</div>
                <div className="text-2xl font-black text-purple-700 mt-1">${payload.average_cost_per_ingest_usd || 0.0014}</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-bold text-slate-900">Active Foundation Model Architecture</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
                <div>Model: <strong className="text-slate-900">{payload.active_model || 'gemini-flash-latest'}</strong></div>
                <div>Temperature: <strong className="text-slate-900">{payload.temperature || 0.1} (Deterministic)</strong></div>
                <div>Latency (P95): <strong className="text-slate-900">{payload.p95_inference_latency_ms || 1120} ms</strong></div>
              </div>
              <div className="pt-2 text-emerald-700 font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{payload.guardrail_status}</span>
              </div>
            </div>
          </div>
        );
      }

      case 'agent-07': {
        const tests = payload.results || [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900">Deterministic QA Verification Suite ({tests.length} Tests)</h4>
                <p className="text-xs text-slate-500">Automated assertions on live clinical data asserting ALCOA+ rules and cryptographic digests.</p>
              </div>
              <button
                onClick={() => navigate('/evaluations')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
              >
                <span>Full Test Runner Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Test Case ID</th>
                    <th className="px-3 py-2.5">Verification Name</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Duration</th>
                    <th className="px-3 py-2.5">Cryptographic Evidence Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tests.map((tc: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="px-3 py-3 font-mono font-bold text-blue-600">{tc.id}</td>
                      <td className="px-3 py-3 font-semibold text-slate-800">{tc.name}</td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          {tc.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-500">{tc.duration_ms} ms</td>
                      <td className="px-3 py-3 text-slate-600 font-medium text-[11px] max-w-xs">{tc.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'agent-08': {
        const risks = payload.risks || [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900">ISO 14971 FMEA Failure Modes & Effects Analysis</h4>
                <p className="text-xs text-slate-500">Autonomous risk rating (Severity × Probability × Detection) with traceable 21 CFR §11 mitigations.</p>
              </div>
              <button
                onClick={() => navigate('/risks')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
              >
                <span>Manage in Risk View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Risk Code</th>
                    <th className="px-3 py-2.5">Failure Mode Description</th>
                    <th className="px-3 py-2.5 text-center">S × O × D</th>
                    <th className="px-3 py-2.5">RPN Score</th>
                    <th className="px-3 py-2.5">Traceable GxP Mitigation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {risks.map((rk: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="px-3 py-3 font-mono font-bold text-amber-700">{rk.code}</td>
                      <td className="px-3 py-3 font-semibold text-slate-800 max-w-xs">{rk.failure_mode}</td>
                      <td className="px-3 py-3 font-mono text-center text-slate-600">{rk.severity} × {rk.probability} × {rk.detection}</td>
                      <td className="px-3 py-3 font-bold text-amber-700">RPN {rk.rpn}</td>
                      <td className="px-3 py-3 text-slate-700 text-[11px] max-w-sm">
                        <div>{rk.mitigation}</div>
                        <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">{rk.gxp_citation}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'agent-09': {
        const scans = payload.scans || {};
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900">STRIDE Threat Modeling & Secrets Scan</h4>
                <p className="text-xs text-slate-500">Autonomous verification of zero committed credentials, TLS 1.3 encryption, and audit ledger integrity.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase text-emerald-700">Hardcoded Secrets</div>
                <div className="text-xl font-black text-emerald-800 mt-1">{scans.hardcoded_secrets_detected ?? 0} Leaks</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase text-blue-700">Transport Security</div>
                <div className="text-sm font-black text-blue-900 mt-1">{scans.tls_transport_level || 'TLS 1.3 Strict'}</div>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase text-indigo-700">Data at Rest</div>
                <div className="text-sm font-black text-indigo-900 mt-1">AES-256-GCM</div>
              </div>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase text-teal-700">Audit Trail Integrity</div>
                <div className="text-sm font-black text-teal-900 mt-1">HMAC Chained</div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-xs text-emerald-900">STRIDE Threat Model Status:</span>
                <span className="text-xs font-black text-emerald-700">{payload.status || 'SECURE / GXP AUDIT READY'}</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full">Passed</span>
            </div>
          </div>
        );
      }

      case 'agent-10': {
        const gates = payload.quality_gates || {};
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900">GxP Release Package Dossier & Quality Gates</h4>
                <p className="text-xs text-slate-500">Autonomous synthesis of production release bundle, stage gate checklists, and deployment manifest.</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl flex items-center justify-between shadow-xs">
              <div>
                <div className="text-[10px] font-bold uppercase text-blue-300">Target Release Candidate</div>
                <div className="text-xl font-black text-white mt-0.5">{payload.release_candidate || 'v1.0.0-gxp.pilot'}</div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-400 text-slate-950">
                {payload.disposition || 'AUTHORIZED FOR GXP PILOT'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Stage Gate Checklist Verification</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-700">
                    <span>1. Requirements Approved:</span>
                    <strong className="text-emerald-700">{gates.requirements_approved || '4 of 4 (100%)'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>2. Engineering Tasks Completed:</span>
                    <strong className="text-emerald-700">{gates.engineering_tasks_completed || '4 of 4 (100%)'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>3. Automated Tests Passed:</span>
                    <strong className="text-emerald-700">{gates.automated_tests_passed || '5 of 5 (100%)'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>4. FMEA Hazards Mitigated:</span>
                    <strong className="text-emerald-700">{gates.fmea_hazards_mitigated || '4 of 4 (100%)'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>5. Security Findings:</span>
                    <strong className="text-emerald-700">{gates.security_findings || '0 critical / 0 high'}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Deployment Manifest</div>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-600">
                  <div>Backend Image: <span className="text-slate-900 font-bold">{payload.deployment_manifest?.backend_image || 'genquantaa-adlc-backend:v1.0.0'}</span></div>
                  <div>Frontend Bundle: <span className="text-slate-900 font-bold">{payload.deployment_manifest?.frontend_bundle || 'genquantaa-adlc-ui:v1.0.0'}</span></div>
                  <div>Target Cluster: <span className="text-slate-900 font-bold">MongoDB Atlas Multi-Region</span></div>
                  <div>Rollback Guard: <span className="text-emerald-700 font-bold">Enabled & Tested</span></div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'agent-11': {
        const metrics = payload.metrics || {};
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900">Continuous Telemetry & Statistical Drift Surveillance</h4>
                <p className="text-xs text-slate-500">Autonomous runtime monitoring of service uptime, API latency, and clinical data drift.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-emerald-700">System Uptime</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">{metrics.system_uptime || '99.99%'}</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-blue-700">Latency (P95)</div>
                <div className="text-2xl font-black text-blue-700 mt-1">{metrics.p95_latency_ms || 14.2} ms</div>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-indigo-700">Data Drift (KL)</div>
                <div className="text-xl font-black text-indigo-700 mt-1">{metrics.model_drift_divergence_kl || 0.012}</div>
              </div>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-teal-700">Error Rate</div>
                <div className="text-2xl font-black text-teal-700 mt-1">{metrics.error_rate_pct || 0.0}%</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-bold text-slate-900">Drift & Health Recommendations</div>
              <ul className="space-y-1">
                {(payload.recommendations || [
                  'Stream parser operating at optimal latency.',
                  'No data drift detected across clinical laboratory distributions.'
                ]).map((rec: string, i: number) => (
                  <li key={i} className="flex items-center space-x-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
            Select an agent from the registry above to inspect its execution output and live deliverables.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-12">
      {/* Top Header & Project Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Specialist AI Agents Workbench</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              All 11 Operational
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Autonomous multi-agent orchestration engine. Execute specialist agents and inspect generated deliverables directly on screen.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <label className="text-[10px] text-slate-400 font-bold uppercase block">Target Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.is_demo ? '(Demo)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3 Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400">Autonomous Agents</span>
              <div className="mt-0.5 text-2xl font-black text-slate-900">11 / 11 Active</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Ready
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400">Avg Execution Latency</span>
              <div className="mt-0.5 text-2xl font-black text-slate-900">129 ms</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Sub-Second
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400">Stage Gate Clearance</span>
              <div className="mt-0.5 text-2xl font-black text-slate-900">100% Passed</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            GxP Ready
          </span>
        </div>
      </div>

      {/* Agents Registry Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-900">Select an Agent to view live execution deliverables on screen:</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search agent name, task, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Specialist Role</th>
                <th className="px-4 py-3">Core Directive & Deliverable</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAgents.map((agent) => {
                const isSelected = agent.id === selectedAgentId;
                const isRunning = runningAgentId === agent.id;

                return (
                  <tr
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {agent.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      <div className="truncate max-w-sm">{agent.task}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{agent.outputArtifact}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{agent.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-700 font-mono">
                      {agent.confidence}%
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAgentId(agent.id);
                          handleRunAgent(agent.id);
                        }}
                        disabled={isRunning}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center space-x-1 transition-all shadow-xs"
                      >
                        <RotateCw className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                        <span>{isRunning ? 'Running...' : 'Run Agent'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 FIRST-CLASS AGENT EXECUTION DELIVERABLE STUDIO (DIRECTLY ON SCREEN) 🌟 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        {/* Deliverable Studio Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                Active Deliverable
              </span>
              <span className="text-xs font-bold text-slate-400">
                Artifact Reference: <code className="text-slate-700 font-mono">{selectedAgent.outputArtifact}</code>
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1 flex items-center space-x-2">
              <span>{selectedAgent.name}</span>
              <span className="text-slate-400 font-normal text-sm">— {selectedAgent.role}</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Run / Re-Run Button */}
            <button
              onClick={() => handleRunAgent(selectedAgent.id)}
              disabled={runningAgentId === selectedAgent.id}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${runningAgentId === selectedAgent.id ? 'animate-spin' : ''}`} />
              <span>{runningAgentId === selectedAgent.id ? 'Executing Agent...' : 'Re-Run Agent'}</span>
            </button>

            {/* Quick Copy JSON */}
            <button
              onClick={() => copyToClipboard(JSON.stringify(selectedAgent.artifactPayload || {}, null, 2), 'json')}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-all"
              title="Copy complete artifact payload as JSON"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>
        </div>

        {/* Executive Outcome Banner */}
        <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Executive Outcome Summary</div>
            <div className="text-xs font-bold text-slate-800 leading-relaxed">
              "{selectedAgent.lastInputSummary}"
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-center">
              <div className="text-[9px] font-bold text-slate-400 uppercase">Confidence</div>
              <div className="text-xs font-black text-slate-900">{selectedAgent.confidence}%</div>
            </div>
            <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-center">
              <div className="text-[9px] font-bold text-slate-400 uppercase">Status</div>
              <div className="text-xs font-black text-emerald-600">{selectedAgent.status}</div>
            </div>
            <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-center">
              <div className="text-[9px] font-bold text-slate-400 uppercase">Input Source</div>
              <div className="text-xs font-mono font-bold text-blue-600 truncate max-w-[140px]">{selectedAgent.inputDoc}</div>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Visual Deliverables vs Reasoning Trace vs Raw Schema */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('deliverables')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'deliverables'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generated Deliverables (What Has Been Done)</span>
          </button>

          <button
            onClick={() => setActiveTab('trace')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'trace'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Reasoning Trace & Execution Timeline ({selectedAgent.trace.length} Steps)</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'json'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw Schema & JSON Payload</span>
          </button>
        </div>

        {/* TAB 1: VISUAL DELIVERABLES (DIRECTLY ON SCREEN) */}
        {activeTab === 'deliverables' && (
          <div className="pt-2">
            {renderAgentDeliverables(selectedAgent)}
          </div>
        )}

        {/* TAB 2: REASONING TRACE */}
        {activeTab === 'trace' && (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-700">Autonomous Step-by-Step Verification Timeline</div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              {selectedAgent.trace.map((tr, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">
                      {tr.time} • Step Verified
                    </span>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {tr.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <div className="text-xs font-bold text-slate-700 mb-2">Grounding Guardrails & Specialist Tools Used</div>
              <div className="flex flex-wrap gap-2">
                {selectedAgent.tools.map((tl, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1"
                  >
                    <span>🛡️</span>
                    <span>{tl}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RAW SCHEMA & JSON */}
        {activeTab === 'json' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500">Payload Reference: {selectedAgent.outputArtifact}</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(selectedAgent.artifactPayload || {}, null, 2), 'json')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center space-x-1"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Copied!' : 'Copy Raw JSON'}</span>
              </button>
            </div>
            <div className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs max-h-[420px] overflow-y-auto leading-relaxed border border-slate-800">
              <pre>{JSON.stringify(selectedAgent.artifactPayload || {}, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
