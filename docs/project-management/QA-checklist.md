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
| **Separation** | Vulnerable logic cleanly separated from future secure version | Pass| README.md file is inserted cleanly under /exploit/ |
| **Exploit Stability** | Insecure paths simple and reproducible for other teammates | Pass |  The saved requests show successful runs|
| **Normal Use** | Legitimate behavior verified prior to attack | PASS|  screenshots attached |
| **Code Comments** | Risks and intended behavior documented with standard practice | Pass  | No code changed, the analyses explain the vulnerable behaviour |
| **Telemetry** | logs and capture support the trace analysis | Pass  | screenshots attached |
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



## 4. Trace Analysis Sign-off (Sachin)
- **Author:** Sachin Senaratne (Detection and Tracing Lead)
- **Reviewer:** Kavin (Exploitation Lead)

| Check Item | Criteria | Result | Notes |
| :--- | :--- | :---: | :--- |
| **Source Correlation** | Burp request/response captures correlated with application server logs | Pass | Timestamp, endpoint, and file/credential parameters link each Burp request to its server-side log event across both NoSQL and Path Traversal traces |
| **Baseline Established** | Normal and negative traces captured before attack traces | Pass | NoSQL: NSQL-01 (`200`) and NSQL-02 (`401`). Path Traversal: PT-01 (listing) and PT-02 (legitimate file, `Traversal flag: false`) |
| **NoSQL Vulnerable Evidence** | Injection traces show object input, operator in query, auth success | Pass | NSQL-03 (`$ne`) and NSQL-04 (`$ne`/`$gt`) show object input types carried into the executed query, returning `200 OK` |
| **Path Traversal Vulnerable Evidence** | Traversal traces show `Traversal flag: true` and out-of-directory file served | Pass | PT-03 and PT-04 both resolve `../../config/.env.secrets` outside `public/documents/` and serve it with `200 OK`, including the JSON-header variant |
| **NoSQL Mitigated Evidence** | Secure build rejects object inputs before query construction | Pass | MNSQL-03 and MNSQL-04 return `400 Bad Request` with a "Rejected: invalid credential type" log line |
| **Path Traversal Mitigated Evidence** | Secure build blocks out-of-directory paths | Pass | MPT-03 and MPT-04 return `403 Forbidden` with "Blocked path component"; MPT-02 shows legitimate access still passes `Boundary check: PASS` |
| **Request-to-Log Linkage** | Every trace carries a timestamp tying the capture to a log entry | Conditional | Raw logs contain timestamps for the NoSQL vulnerable run (27 Sep 2026) and mitigated run (03 Oct 2026), both UTC. Formats vary: the vulnerable NoSQL log includes clock/Apache timestamps (`12:09:36`, `27/Sep/2026:12:09:36`) and an ISO-8601 timestamp (`2026-09-27T12:09:36Z`) for the same event, while mitigated and Path Traversal traces use ISO-8601. NSQL-01/02 baseline timestamps were normalized and backfilled. Standardize the quoted format in the write-up and retain the source timestamps for auditability |
| **Comparison Clarity** | Before/after behaviour summarised in readable comparison tables | Pass | Four comparison tables (vulnerable + mitigated, for each vulnerability) contrast input, validation handling, and HTTP result |
| **Scope Coverage** | Trace analysis covers all vulnerabilities in the project | Pass | Both in-scope vulnerabilities (NoSQL Injection and Path Traversal) now have full vulnerable and mitigated trace analysis |
| **Sign-off** | Ready for integration / final reporting? | Pass | Evidence complete for both vulnerabilities. Remaining items are editorial: normalise the quoted timestamp format, note the 6-day gap between the exploit and mitigation runs, and fix the typos |
