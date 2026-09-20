# **ISEC3004 Assignment 1** 

**Project Schedule and Milestone Plan** 

NoSQL Injection & Path Traversal | Group Security Project 

**Team members** Shaheem, Bilal, Aadhil, Kavin, Sachin **Submission deadline** 9 October 2026 at 23:59 

## **1. Scheduling approach** 

The project is managed as a sequence of dependent security-development stages. Research and vulnerable-code development are completed first, followed by exploitation, detection/tracing, mitigation, verification, report consolidation, quality assurance, and live-demo preparation. **The internal deadline is 8 October 2026** so that 9 October remains a submission buffer rather than a development day. 

## **2. Timeline and task schedule** 

|**Period**|**Milestone**|**Key activity**|**Lead(s)**|**Completion evidence**|
|---|---|---|---|---|
|12-14 Sep|Project initiation|Confirm NoSQL Injection and Path Traversal; create GitHub<br>repository/project board; agree on environment, folder structure,<br>roles, and demo architecture.|Everyone|Repository and project board created; roles<br>agreed; environment defined.|
|15-20 Sep|Research +<br>vulnerable baseline|Complete research for both vulnerabilities and get both intentionally<br>vulnerable program features running reliably.|Bilal + Aadhil|Theory notes/references complete; vulnerable<br>NoSQL and Path Traversal features working.|
|21-25 Sep|Exploit development|Create controlled exploitation procedures and confirm both<br>vulnerabilities can be reproduced consistently in the assessment<br>environment.|Kav + Aadhil|Repeatable exploit procedure and evidence<br>for both vulnerabilities.|
|23-27 Sep|Detection and tracing|Run the exploits while capturing relevant HTTP requests,<br>application/server logs, traces, and observations.|Sachin + Kav|Normal-vs-malicious evidence and tracing<br>analysis captured.|
|27 Sep-1 Oct|Mitigation<br>implementation|Implement secure versions of both vulnerable features and<br>document the security changes.|Shaheem +<br>Aadhil|Mitigated code working while preserving<br>normal functionality.|
|1-3 Oct|Mitigation verification|Repeat the original attacks against the mitigated versions and<br>collect evidence showing that the attacks are rejected, blocked, or<br>safely handled.|Shaheem +<br>Kav + Sachin|Before/after verification results for both<br>vulnerabilities.|
|3-5 Oct|Report completion|Each member completes their assigned report section and submits<br>all screenshots, logs, code excerpts, and references for integration.|Everyone|All technical report sections and supporting<br>evidence complete.|
|6 Oct|Cross-review|Review the full report, code, exploit procedures, tracing evidence,<br>and mitigation claims for accuracy and consistency.|Everyone|Review issues resolved; report and program<br>agree with each other.|
|7 Oct|Full live-demo<br>rehearsal|Run the presentation from start to finish using the final demo<br>environment and assigned speaker order.|Everyone|Successful end-to-end rehearsal; backup plan<br>confirmed.|
|8 Oct|Code freeze + final<br>QA|Stop feature changes; perform final checks on repository, report,<br>evidence, setup instructions, and presentation files.|Everyone|Submission-ready package approved<br>internally.|
|9 Oct|Final submission|Perform final integrity check and submit the program and report well<br>before 23:59.|Everyone|Submission completed and<br>receipt/confirmation retained.|
|After Submission|Presentation rehearsal|Continue rehearsing individual speaking roles and the live demonstration for the Week 12 laboratory presentation.|Everyone|Presentation-ready team.|



## **3. Major milestones** 

|**Milestone**|**Target**|**Exit criterion**|
|---|---|---|
|M1 - Project setup complete|14 Sep|Repository, task board, team roles, chosen technologies, and demo architecture confirmed.|
|M2 - Vulnerable baseline complete|20 Sep|Both vulnerable features operate normally and are ready for controlled exploitation.|
|M3 - Exploitation and tracing<br>complete|27 Sep|Both exploits are reproducible and supported by captured logs/traces.|
|M4 - Secure versions complete|1 Oct|Mitigated versions implemented for both vulnerabilities.|
|M5 - Security verification complete|3 Oct|Original attacks retested against secure versions with evidence of mitigation.|
|M6 - Report content complete|5 Oct|All member-owned report sections and evidence submitted for integration.|
|M7 - Final QA complete|8 Oct|Code frozen; report, repository, evidence, and demo package checked and approved.|
|M8 - Submission|9 Oct|Program and report submitted before 23:59.|



## **4. Progress monitoring and schedule control** 

- The GitHub Project board will be updated when work moves through To Do, In Progress, Review/Testing, and Done. 

- Each major task should have one named owner, a target completion date, and supporting evidence such as a commit, pull request, screenshot, log, test result, or report draft. 

- Dependencies must be respected: exploitation depends on a stable vulnerable baseline; tracing depends on reproducible exploitation; mitigation verification depends on reusing the original exploit tests. 

- If a milestone slips, the team will record the delay on the project board, identify the blocker, assign recovery work, and protect the 8 October internal deadline. 

- No major functionality changes should be introduced after the 8 October code freeze unless they fix a submissionblocking defect. 
