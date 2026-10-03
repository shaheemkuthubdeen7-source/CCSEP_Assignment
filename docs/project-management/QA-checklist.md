# Quality Assurance (QA) Checklists

## 1. Vulnerable Baseline Inspection
- **Author:** Aadhil Rizwan (Vulnerable Application Development Lead)
- **Reviewer:** Shaheem (Mitigation Lead)

| Check Item | Criteria | Result | Notes |
| :--- | :--- | :---: | :--- |
| **Separation** | Vulnerable logic cleanly separated from future secure version | Pass|  NoSQL and path traversal are seperated into their own directories and run independently on ports 3000 and 3001|
| **Exploit Stability** | Insecure paths simple and reproducible for Kav | Pass |  Performed checking on the vulnerable code to ensure exploit paths are reproducible|
| **Normal Use** | Legitimate behavior verified prior to attack | Pass|  Tested normal behavior by using credentials given in the setup.md document|
| **Code Comments** | Risks and intended behavior documented with standard practice | Pass  |  Both vulnerable codes document the intented behavior|
| **Telemetry** | Logging points available for Sachin | Pass|   Tested logins from terminal to make sure tracing and logging is possible|
| **Sign-off** | Ready for mitigation branching? |  Pass|  Branch can be successfully merged|

---

## 2. Exploitability Sign-off (Kavin)
- **Author:** Kavin (Exploitation Lead)

- Reviewer: Aadhil Rizwan.

| Check Item | Criteria | Result | Notes |
| :--- | :--- | :---: | :--- |
| **Separation** | Vulnerable logic cleanly separated from future secure version | FAULT| README.md file is inserted under path-traversal/vulnerable and should be moved to /exploit/ |
| **Exploit Stability** | Insecure paths simple and reproducible for other teammates | Pass |  The saved requests show successful runs|
| **Normal Use** | Legitimate behavior verified prior to attack | UNAVAILABLE|  No screenshots attached |
| **Code Comments** | Risks and intended behavior documented with standard practice | Pass  | No code changed, the analyses explain the vulnerable behaviour |
| **Telemetry** | logs and capture support the trace analysis | UNAVAILABLE| No screenshots attached |
|**Safe Demo Data**| Exploits use controlled, harmless assessment data | Pass | The target is the project’s lab-simulation .env.secrets file, with credential values redacted in the captures |
| **Sign-off** | Ready for mitigation branching? |  Pass|  Branch can be successfully merged since mitigation branch doesn't require screenshots  |

---

## 3. Mitigation Sign-off (Shaheem)
- **Author:** Shaheem (Mitigation Lead)

- Reviewer: Sachin Senaratne.

| Check Item | Criteria | Result | Notes |
| --- | --- | --- | --- |
| NoSQL Mitigation | Unexpected structured query objects/operators are rejected or safely handled | **Passed** | The unchanged NoSQL attack cases were tested and were successfully rejected or safely handled by the mitigation. |
| NoSQL Normal Use | Legitimate login still works | **Passed** | Normal login using valid credentials was tested successfully and authentication worked as expected. |
| Path Traversal Mitigation | Traversal outside permitted directory is rejected/safely neutralised | **Passed** | The unchanged path traversal exploit cases were executed and attempts to access files outside the permitted directory were successfully rejected. |
| Path Normal Use | Approved document can still be accessed | **Passed** | `audit_report_2026.txt` was accessed successfully from the permitted directory. |
| Logging | Mitigated requests produce useful trace evidence | **Passed** | Server logs and request evidence were checked and provided sufficient information to confirm that the mitigated requests were processed and rejected appropriately. |
| Code Review | Secure changes match intended mitigation | **Passed** | The implemented changes matched the intended NoSQL injection and path traversal mitigations. |
| Evidence | Screenshots/logs confirm secure behavior | **Passed** | The captured screenshots and server/request logs confirm secure behavior. |
| Sign-off | Ready for integration? | **Passed** | Branch can be merged successfully |
