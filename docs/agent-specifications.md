# GENQUANTAA ADLC — Specialist Agent Specifications

GENQUANTAA ADLC defines a versioned registry of 11 specialist AI agents. In Milestone 1-4, four agents are active for the MVP slice (Agents 1, 2, 7, and 8), with the remaining seven registered and planned for subsequent phases.

---

## 1. Intake and Requirements Agent (`agent_01_intake_requirements`) — **Active MVP**
- **Status**: Active (MVP)
- **Version**: 1.0.0
- **Input Schema**:
  - `project_prompt`: string
  - `uploaded_documents`: list of document references & extracted text
  - `project_metadata`: name, intended use, domain, risk tier
  - `extraction_schema`: target requirement structure
- **Output Schema**:
  - `project_brief`: summary of intent
  - `requirement_drafts`: list of requirements with ID, title, type (functional, regulatory, safety, performance), priority, acceptance criteria, and source citation
  - `missing_information_questions`: questions for clinical/technical lead
- **Allowed Tools**: Document text parser, schema validator, citation mapper.
- **Review Requirement**: Mandatory human approval before requirements become authoritative.

---

## 2. Planning and Task Breakdown Agent (`agent_02_planning_task`) — **Active MVP**
- **Status**: Active (MVP)
- **Version**: 1.0.0
- **Input Schema**:
  - `approved_project_brief`: verified project intent
  - `approved_requirements`: locked requirements list
  - `team_roles`: available engineering and validation roles
  - `schedule_constraints`: milestones and priority levels
- **Output Schema**:
  - `task_drafts`: tasks with ID, description, dependencies, suggested role, acceptance criteria
  - `test_case_drafts`: verification specifications linked to requirements
  - `definition_of_done`: criteria for task completion
- **Allowed Tools**: WBS generator, dependency analyzer.
- **Review Requirement**: Reviewable by Platform Lead before committing tasks.

---

## 3. Architecture and API Design Agent (`agent_03_architecture_api`) — **Active MVP**
- **Status**: Active (MVP)
- **Version**: 1.0.0
- **Input Schema**:
  - `approved_requirements`: locked requirements from Agent 1
  - `tech_stack_constraints`: FastAPI, React, MongoDB Atlas, OpenAPI 3.1
  - `gxp_security_boundary`: 21 CFR Part 11, TLS 1.3, SHA-256 HMAC ledger
- **Output Schema**:
  - `component_topology`: Microservice topology with GxP compliance notes
  - `openapi_endpoints`: Complete REST endpoint specs (methods, paths, request/response contracts, linked reqs)
  - `cdisc_data_dictionary`: CDISC SDTM v3.3 clinical variable types and validation bounds
  - `security_boundary`: 21 CFR Part 11 electronic records controls
- **Allowed Tools**: OpenAPI generator, Schema synthesizer, CDISC terminology validator.
- **Review Requirement**: Reviewable by System Architect before implementation sprints.


---

## 4. Data Engineering Agent (`agent_04_data_engineering`) — *Planned*
- **Status**: Planned
- **Version**: 0.1.0-draft
- **Input Schema**: Dataset references, schema dictionary, quality rules, transformation criteria.
- **Output Schema**: Dataset profiles, data quality reports, transformation pipelines, rejected row audit log.

---

## 5. Software Development Agent (`agent_05_software_dev`) — *Planned*
- **Status**: Planned
- **Version**: 0.1.0-draft
- **Input Schema**: Approved task, repo context, coding guidelines, API contracts, acceptance criteria.
- **Output Schema**: Proposed code changes/patch, unit test drafts, change summary, requirement links.

---

## 6. Model and LLM Development Agent (`agent_06_model_llm_dev`) — *Planned*
- **Status**: Planned
- **Version**: 0.1.0-draft
- **Input Schema**: Intended use, approved datasets, model configuration, prompt templates, evaluation metrics.
- **Output Schema**: Experiment run logs, versioned model/prompt configs, benchmark results.

---

## 7. QA and Test Agent (`agent_07_qa_test`) — **Active MVP**
- **Status**: Active (MVP)
- **Version**: 1.0.0
- **Input Schema**: Requirements, acceptance criteria, build references, test thresholds, test data.
- **Output Schema**: Test execution requests, deterministic test results, pass/fail status, execution duration, stdout/stderr logs, requirement links, defect tickets for failures.
- **Allowed Tools**: Deterministic test runner, CSV schema validator, assertion engine.
- **Governance Gate**: Any failed mandatory test blocks lifecycle stage transition.

---

## 8. AI Risk and Compliance Agent (`agent_08_ai_risk_compliance`) — **Active MVP**
- **Status**: Active (MVP)
- **Version**: 1.0.0
- **Input Schema**: Intended use, system boundaries, impact context, data classification, regulatory templates.
- **Output Schema**: Risk assessment matrix, proposed mitigating controls, required-evidence checklist, compliance gap report.
- **Allowed Tools**: Risk taxonomy matcher, GxP / EU AI Act checklist engine.
- **Review Requirement**: Mandatory human compliance officer sign-off.

---

## 9. Security Agent (`agent_09_security`) — *Planned*
- **Status**: Planned
- **Version**: 0.1.0-draft
- **Input Schema**: Architecture specs, code changes, dependency manifest, threat model rules.
- **Output Schema**: Security findings, vulnerability scan summaries, remediation tasks.

---

## 10. Release and Deployment Agent (`agent_10_release_deployment`) — *Planned*
- **Status**: Planned
- **Version**: 0.1.0-draft
- **Input Schema**: Release candidate, CI results, risk status, signed evidence records, rollback instructions.
- **Output Schema**: Release readiness summary, deployment manifests, release notes, audit package.

---

## 11. Monitoring and Optimization Agent (`agent_11_monitoring_optimization`) — *Planned*
- **Status**: Planned
- **Version**: 0.1.0-draft
- **Input Schema**: Runtime telemetry, cost, latency, error logs, drift metrics, alert thresholds.
- **Output Schema**: Telemetry alerts, incident reports, model drift alerts, cost/performance recommendations.
