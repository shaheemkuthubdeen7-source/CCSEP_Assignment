## ISEC3004 - Exploitation process for NoSQL and path traversal attacks

### Introduction

This report documents the exploitation process for two web application vunerabilties, NoSQL injection and Path traversal. NoSQL injection is usually an attack from an user-supplied input without any validation in its type. (NoSQL Security - OWASP Cheat Sheet Series, 2025) Path traversal is a directory level attack where the attacker can get access to files on the server which are outside of the web server's root folder. (Path Traversal | OWASP Foundation, 2026)

The testing was carried out against two deliberately-made vunerable applications running in an virtual environment server. One application exposes a NoSQL authentication endpoint and the other is a document retrieval service application. For each vunerability, a legitimate baseline was first established so that a normal behaviour could be recorded and then later distinguished from an attack. A controlled exploit was then executed and traced using Burp suite request and response captures compared againtst the application's server logs, so that each attack could be followed from the input across the applications processing decision, to the resulting response. Finally, the same inputs played against a secure build o each aplicaiton to confirm that the mitigation closed the vunerability without distrupting the legitimate use. All testing used harmless and controlled data and any sensitive values appeared in the captures were redacted. 

### Vunerability 1 - NoSQL Injection

NoSQL injection targets applications that build database queries directly from user input. Unlike traditional SQL injection, which relies on breaking out of a string within a query, NoSQL injection often exploits the fact that document databases such as MongoDB accept structured query objects. If an application passes user input straight into a query without confirming that it is a simple string, an attacker can submit an object containing query operators instead of an ordinary value, changing the meaning of the query itself.

The vulnerable application exposed a login endpoint at POST /api/auth/login, which accepted a JSON body containing a username and password. Under normal use, both fields were supplied as strings and the application constructed an equality query to match the stored credentials. This baseline behaviour was confirmed first: a valid login returned 200 OK and an authenticated session, while an incorrect password was correctly rejected with 401 Unauthorized. This established that the application could distinguish valid from invalid credentials before any attack was attempted.

The exploit replaced the password string with an object containing the $ne ("not equal") operator, {"$ne": ""}. Because the application did not validate the input type, this object was incorporated directly into the database query. The resulting query matched any record whose password was not an empty string, meaning every account and the application authenticated the request as the administrator, returning 200 OK. The server log confirmed the cause, recording the password input type as object rather than string and showing the operator carried into the executed query. A second variant supplied operators in both fields, {"$ne": ""} for the username and {"$gt": ""} for the password, producing the same successful authentication. In both cases the application granted administrative access without any knowledge of a valid password, demonstrating a complete authentication bypass.

### Vunerability 2 - Path Traversal

Path traversal exploits applications that build file paths from user input without restricting which directory the request can reach. By including traversal sequences such as ../ in a filename, an attacker can step up and out of the intended directory and request files elsewhere on the server, including configuration files and credentials that were never meant to be served.

The vulnerable application provided a document service that listed and returned files from an intended directory of public/documents/. The baseline behaviour was confirmed first by requesting the document listing returned the expected set of files, and requesting a legitimate document such as audit_report_2026.txt returned its contents with 200 OK. Importantly, the application's own log recorded a Traversal flag, whic is false for this request and resolved the file inside the permitted directory, showing that normal access behaved as intended.

The exploit changed the file parameter to ../../config/.env.secrets, using two traversal sequences to climb out of the documents directory and into the application's configuration directory. The application returned 200 OK along with the contents of the secrets file. The server log provided the key evidence: it recorded a Traversal flag: true, indicating the application detected the traversal pattern, yet it still resolved the request to a path outside the permitted directory and served the file. This shows that detection alone, without an enforced boundary check, did not prevent the disclosure. The attack was repeated with a JSON Accept header, which returned the same file contents within a JSON response, confirming that the behaviour was not dependent on the response format. In both cases a restricted credentials file was successfully disclosed through a single crafted request.


### Conclusion

This report demonstrated the end-to-end exploitation of a NoSQL injection and a path traversal vulnerability, from establishing legitimate baselines through to executing controlled attacks and verifying their mitigations. In the vulnerable builds, the NoSQL endpoint was bypassed by submitting query operators in place of string credentials, granting administrative access without a valid password, and the document service was made to disclose a restricted secrets file by escaping its intended directory. In both cases the server logs confirmed the mechanism of the attack and linked it directly to the captured requests.

The mitigations, each built on strict input validation, closed both vulnerabilities while preserving legitimate functionality: operator-based login attempts were rejected with 400 Bad Request, out-of-directory file requests were rejected with 403 Forbidden, and normal use continued to work in both applications. The exercise reinforces that validating input against expected types and boundaries, rather than filtering for known attacks, is the most reliable defence against this class of vulnerability.

### References (APA 7th)

Path Traversal | OWASP Foundation. (2026). Owasp.Org. https://community.owasp.org/attacks/Path_Traversal

NoSQL Security - OWASP Cheat Sheet Series. (2025). Owasp.Org. https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html
