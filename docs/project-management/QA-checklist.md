# Quality Assurance (QA) Checklists

## 1. Vulnerable Baseline Inspection
- **Author:** Aadhil Rizwan (Vulnerable Application Development Lead)
- **Reviewer:** Shaheem (Mitigation Lead)
- **Date:** September 2026

| Check Item | Criteria | Result | Notes |
| :--- | :--- | :---: | :--- |
| **Separation** | Vulnerable logic cleanly separated from future secure version | **PASS** | `routes/auth.js` and `routes/documents.js` cleanly isolated. |
| **Exploit Stability** | Insecure paths simple and reproducible for Kav | **PASS** | `req.body.password` passed to query; `path.join` unconstrained. |
| **Normal Use** | Legitimate behavior verified prior to attack | **PASS** | `verify_normal.sh` runs 6/6 tests passing. |
| **Code Comments** | Risks and intended behavior documented with standard practice | **PASS** | Purpose and risk clearly commented in headers and inline. |
| **Telemetry** | Logging points available for Sachin | **PASS** | Structured `[AUTH]` and `[DOC]` trace logs emitted to console. |
| **Sign-off** | Ready for mitigation branching? | **APPROVED** | Shaheem approved baseline for mitigation work. |

---

## 2. Exploitability Sign-off (Kav)
- **Reviewer:** Kav (Exploitation Lead)
- **NoSQL Injection:** Tested `POST /api/auth/login` with `{"password": {"$ne": ""}}` $\rightarrow$ Verified bypass.
- **Path Traversal:** Tested `GET /api/documents/view?file=../../config/.env.secrets` $\rightarrow$ Verified file dump.
- **Verdict:** Both endpoints reliably exploitable in controlled lab environment.
