## **Effort Estimation Plan** 

NoSQL Injection & Path Traversal | Group Security Project 

### **Team members** 

Shaheem, Bilal, Aadhil, Kavin, Sachin 

# **1. Major-task effort estimates** 

|**Major task**|**Owner(s)**|**Scope of estimate**|**Estimate**|
|---|---|---|---|
|Project setup & architecture|Everyone|Repository, project board, local environment, agreed application structure, task allocation and<br>dependencies.|5.0 h|
|Research: both vulnerabilities|Bilal|Research definitions, causes, common exploitation patterns, impacts, mitigation principles and<br>references.|5.0 h|
|Vulnerable application: NoSQL|Aadhil|Implement and test the intentionally vulnerable NoSQL-backed feature plus test data and<br>comments.|4.0 h|
|Vulnerable application: Path<br>Traversal|Aadhil|Implement and test the intentionally vulnerable file endpoint plus controlled demo files.|4.0 h|
|Exploit development: NoSQL|Kav|Develop, document and repeatedly validate the controlled NoSQL exploitation procedure.|3.5 h|
|Exploit development: Path<br>Traversal|Kav|Develop, document and repeatedly validate the controlled path traversal procedure.|3.5 h|
|Tracing: NoSQL|Sachin|Capture normal/malicious requests, server/application evidence and interpret the trace.|3.0 h|
|Tracing: Path Traversal|Sachin|Capture normal/malicious file requests, logs and explain the abnormal path behaviour.|3.0 h|
|Mitigation: NoSQL|Shaheem|Implement secure input/query handling and verify normal functionality remains intact.|3.5 h|
|Mitigation: Path Traversal|Shaheem|Implement safe path resolution/allow-listing and verify intended file access still works.|3.5 h|
|Mitigation verification|Shaheem + Kav +<br>Sachin|Repeat the original exploits against secure versions and capture before/after evidence.|6.0 h team|
|Technical report sections|Everyone|Each member writes the report section for their own technical responsibility with evidence and<br>explanation.|15.0 h team|
|Report integration & editing|Bilal + Shaheem|Combine sections, remove duplication, check terminology, formatting, evidence and technical<br>consistency.|5.0 h team|
|Cross-review / QA|Everyone|Peer review code, exploits, traces, mitigation, report claims and reproducibility.|7.5 h team|
|Presentation & live-demo<br>preparation|Everyone|Slides, speaker preparation, demo sequence, full rehearsal and backup checks.|7.5 h team|
|Final packaging & submission<br>check|Everyone|Repository cleanup, README check, file integrity, final report/program package and submission<br>verification.|2.5 h team|





# **3. Estimated workload by team member** 

|**Member**|**Planned work included in estimate**|**Total**|
|---|---|---|
|Bilal|Research and theory (5.0), own report writing (3.0), report integration/editing (3.0), peer review/QA (2.0), presentation/rehearsal (2.0), shared<br>setup/final checks (1.5).|16.5 h|
|Aadhil|NoSQL vulnerable code (4.0), Path Traversal vulnerable code (4.0), setup/testing documentation (2.0), own report writing (2.5), peer<br>review/QA (1.5), presentation/rehearsal (1.5), shared setup/final checks (1.0).|16.5 h|
|Kav|NoSQL exploit (3.5), Path Traversal exploit (3.5), repeatability/evidence (1.5), mitigation re-test contribution (2.0), own report writing (2.5),<br>peer review/QA (1.5), presentation/rehearsal (1.5), shared setup/final checks (1.0).|17.0 h|
|Sachin|NoSQL tracing (3.0), Path Traversal tracing (3.0), evidence annotation/analysis (2.0), mitigation re-test contribution (2.0), own report writing<br>(2.5), peer review/QA (1.5), presentation/rehearsal (1.5), shared setup/final checks (1.0).|16.5 h|
|Shahee<br>m|NoSQL mitigation (3.5), Path Traversal mitigation (3.5), mitigation verification/integration (2.5), own report writing (2.5), final technical<br>integration (1.5), peer review/QA (1.5), presentation/rehearsal (1.5), shared setup/final checks (1.0).|17.5 h|



