# Task Allocation & Responsibility Matrix

**Unit:** ISEC3004 Group Security Project  
**Submission Deadline:** 9 October 2026 at 23:59  
**Team Composition:**
- **Aadhil Rizwan**: Vulnerable Application Development Lead
- **Kav**: Exploitation Lead
- **Sachin**: Detection and Tracing Lead
- **Shaheem**: Mitigation Lead
- **Bilal**: Report and Project Management Coordinator

---

## 1. Work Breakdown & Task Estimates

| Ticket ID | Task Name | Assignee | Story Points | Est. Hours | Status | Dependencies |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **SEC-101** | Architecture design & tech stack selection (Node/Mongo) | **Aadhil Rizwan** | 3 | 4h | **Done** | None |
| **SEC-102** | NoSQL Injection baseline implementation & comments | **Aadhil Rizwan** | 5 | 6h | **Done** | SEC-101 |
| **SEC-103** | Path Traversal baseline implementation & comments | **Aadhil Rizwan** | 5 | 6h | **Done** | SEC-101 |
| **SEC-104** | Interactive live-demo web portal & UI styling | **Aadhil Rizwan** | 3 | 4h | **Done** | SEC-102, SEC-103 |
| **SEC-105** | Database seeding script & resilient in-memory fallback | **Aadhil Rizwan** | 2 | 3h | **Done** | SEC-101 |
| **SEC-106** | Normal use verification suite (`verify_normal.sh`) | **Aadhil Rizwan** | 3 | 4h | **Done** | SEC-102, SEC-103 |
| **SEC-107** | Peer QA review & baseline freeze tag (`v1.0.0`) | **Shaheem / Aadhil** | 2 | 2h | **Done** | SEC-102..SEC-106 |
| **SEC-108** | Controlled exploitation scripts & procedures | **Kav** | 8 | 10h | In Progress | SEC-107 |
| **SEC-109** | Log analysis, proxy interception & detection tracing | **Sachin** | 8 | 10h | In Progress | SEC-107, SEC-108 |
| **SEC-110** | Security-enhanced code & mitigation implementation | **Shaheem** | 8 | 10h | In Progress | SEC-107 |
| **SEC-111** | Mitigation verification & comparative testing | **Shaheem / Kav** | 5 | 6h | Queued | SEC-108, SEC-110 |
| **SEC-112** | Master report consolidation & editorial review | **Bilal** | 5 | 8h | Queued | All Sections |
