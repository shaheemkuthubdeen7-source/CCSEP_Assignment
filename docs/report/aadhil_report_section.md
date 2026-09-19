# ISEC3004 Group Security Project: Individual Contribution Report
## Section Contribution: Vulnerable Application Design and Baseline Environment
**Name:** Aadhil Rizwan  
**Author:** Aadhil Rizwan  
**Role:** Vulnerable Application Development Lead  
**Vulnerabilities Covered:** NoSQL Injection & Path Traversal (Path Resolution Vulnerability)  
**Target Recipient:** Bilal (Report & Documentation Lead) for final report integration  

---

## 1. Executive Summary of Role Responsibilities

As the **Vulnerable Application Development Lead**, my core responsibility within our group project was to architect, implement, comment, and verify the intentionally vulnerable baseline application. This baseline serves as the foundational artifact for all subsequent team tasks:
1. Providing **Kav (Exploitation Lead)** with a reliable, reproducible target to develop and validate controlled attack procedures.
2. Generating rich, structured telemetry for **Sachin (Detection and Tracing Lead)** to analyze using security tools (such as proxy interceptors and log analysis).
3. Establishing a frozen reference build (`v1.0.0-vulnerable-baseline`) against which **Shaheem (Mitigation Lead)** can develop and rigorously compare the security-enhanced code.
4. Ensuring both features function flawlessly under legitimate normal-use conditions prior to exploitation.

---

## 2. Environment & System Setup

To ensure total reproducibility across diverse development operating systems and during our live laboratory demonstration, the baseline was implemented as a portable Node.js and Express application backed by MongoDB.

### 2.1 Technology Stack & Prerequisites
- **Runtime Environment:** Node.js v20+ / v25 LTS with ECMAScript 2022 support.
- **Web Framework:** Express.js v4.21.2.
- **Database & ODM:** MongoDB v8.2.4 with Mongoose v8.9.5.
- **Portability Mechanism:** An embedded in-memory MongoDB fallback (`mongodb-memory-server` v10.1.3) was integrated into `config/db.js`. If a local MongoDB service is active on `mongodb://127.0.0.1:27017`, the system automatically connects to it; otherwise, it dynamically initializes an in-memory database instance. This prevents environment-related failures during live assessment demonstrations.
- **HTTP Middleware & Logging:** `morgan` (v1.10.0) combined with custom console event emitters providing structured JSON logging of client IP addresses, headers, parameters, and query structures.
- **Client Demonstration Interface:** Semantic HTML5 and modern Vanilla CSS (responsive glassmorphism interface) located in `public/`.

### 2.2 Local Deployment Steps
1. **Clone and Install:**
   ```bash
   cd isec3004-vulnerable-app
   npm install
   ```
2. **Database Seeding (`scripts/seed.js`):**
   ```bash
   npm run seed
   ```
   This populates the MongoDB `users` collection with three baseline accounts:
   - `alice_admin` (`AdminSecret#2026`) - Role: Administrator
   - `bob_analyst` (`AuditPass!99`) - Role: Security Analyst
   - `charlie_guest` (`GuestWelcome123`) - Role: Auditor
3. **Application Execution:**
   ```bash
   npm start
   ```
   The server launches at `http://localhost:3000`.

---

## 3. Vulnerable Code Design: NoSQL Injection

### 3.1 Feature Description & Intended Data Flow
The targeted feature is the corporate authentication endpoint implemented in `routes/auth.js` at `POST /api/auth/login`. 

**Intended Data Flow:**
1. A legitimate client submits an HTTP POST request containing credentials formatted as JSON:
   ```json
   { "username": "alice_admin", "password": "AdminSecret#2026" }
   ```
2. The Express server passes the request through the `express.json()` middleware, parsing the raw body into `req.body`.
3. The controller extracts `username` and `password` and executes a lookup using Mongoose:
   `User.findOne({ username, password })`.
4. If a matching user record exists, the server returns an HTTP 200 response with user metadata and a session token. If the credentials fail to match, an HTTP 401 Unauthorized response is returned.

### 3.2 Vulnerable Code Snippet & Exact Insecure Line
The critical vulnerability resides in `routes/auth.js`, specifically at **Line 44**:

```javascript
// File: routes/auth.js (Lines 39-50)
  try {
    // Insecure query filter: untrusted object input is not cast to string or sanitized.
    // An attacker can pass query operator objects like { "$ne": "" } to evaluate to true.
    const queryFilter = {
      username: username,
      password: password  // Line 44: Untrusted object can contain MongoDB query operators
    };

    console.log('[AUTH] Executing query:', JSON.stringify(queryFilter));

    const user = await User.findOne(queryFilter);
```

### 3.3 Root Cause Analysis: Why the Input Handling is Unsafe
The fundamental security defect in this code is the **lack of type and schema validation on incoming JSON data before passing it to the database query engine**.

1. **Implicit Object Deserialization:** Express's built-in `express.json()` middleware parses arbitrary JSON objects. Unlike traditional relational database drivers that treat SQL parameters as bound primitive values (or fail when an object is passed to a prepared statement placeholder), MongoDB queries are themselves expressed as JavaScript/BSON objects.
2. **Query Operator Injection:** If an attacker substitutes a string literal with a nested JSON object containing a MongoDB operator (such as `{"$ne": ""}` or `{"$gt": ""}`):
   ```json
   {
     "username": "alice_admin",
     "password": { "$ne": "" }
   }
   ```
   The constructed filter becomes:
   `{ username: "alice_admin", password: { "$ne": "" } }`.
3. **Authentication Bypass Impact:** MongoDB evaluates the condition *"where username equals 'alice_admin' AND password is NOT EQUAL to empty string"*. Because the administrator's password is non-empty, the database returns the `alice_admin` document, granting the attacker full administrative access without knowledge of the password.
4. **Data Exfiltration:** Beyond simple authentication bypass, an attacker can leverage regex query operators (`{"$regex": "^a"}`) to systematically enumerate credentials or exfiltrate private database records character by character.

---

## 4. Vulnerable Code Design: Path Traversal (Path Resolution)

### 4.1 Feature Description & Intended Directory Boundary
The second feature is a compliance document repository service implemented in `routes/documents.js` at `GET /api/documents/view`.

**Intended Directory Boundary:**
The system is explicitly intended to serve only non-sensitive compliance, policy, and audit text files residing inside:
```
<project_root>/public/documents/
```
Permitted files include `audit_report_2026.txt`, `security_policy_v2.txt`, and `network_guidelines.txt`.

### 4.2 Vulnerable Code Snippet & Exact Insecure Line
The critical vulnerability resides in `routes/documents.js`, specifically at **Line 54**:

```javascript
// File: routes/documents.js (Lines 42-56)
router.get('/view', (req, res) => {
  const fileName = req.query.file;

  if (!fileName) {
    return res.status(400).json({
      status: 'error',
      message: "Missing 'file' query parameter. Example: ?file=audit_report_2026.txt"
    });
  }

  // Insecure path resolution: path.join normalizes '../' without boundary checking.
  // Supplying a relative path like '../../config/.env.secrets' escapes the intended directory.
  const targetFilePath = path.join(PERMITTED_DOCUMENT_DIR, fileName); // Line 54
```

### 4.3 Root Cause Analysis: Why Path Handling Fails to Enforce Boundary
The vulnerability occurs because Node's native `path.join()` function performs path normalization (resolving `.` and `..` segments), but **does not enforce access control boundaries**.

1. **Path Resolution Traversal:** When an attacker passes a relative path such as `../../config/.env.secrets`, `path.join` evaluates:
   `path.join('/app/public/documents', '../../config/.env.secrets')`
   which normalizes to:
   `/app/config/.env.secrets`.
2. **Missing Boundary Containment Check:** The code performs no check to verify that `targetFilePath.startsWith(PERMITTED_DOCUMENT_DIR)`.
3. **Impact:** An attacker can traverse out of the public documents directory into arbitrary parent directories, reading sensitive files such as application source code (`server.js`), package configurations (`package.json`), or simulated production secrets (`config/.env.secrets`). In a real-world Linux environment, this would allow reading system files such as `/etc/passwd`.

---

## 5. Verification of Normal Application Behaviour

To fulfill our quality assurance requirements and ensure a clean baseline before handing off to **Kav** and **Sachin**, I created an automated test suite (`scripts/verify_normal.sh`) that validates legitimate operation.

### 5.1 Test Cases Executed
1. **Health Verification:** `GET /api/health` returns status `200 OK` and confirms baseline version.
2. **Legitimate Authentication:** `POST /api/auth/login` with `alice_admin` and valid password `AdminSecret#2026` returns `200 OK` and user identity.
3. **Credential Rejection:** `POST /api/auth/login` with incorrect password returns `401 Unauthorized`.
4. **Legitimate Document Retrieval:** `GET /api/documents/view?file=audit_report_2026.txt` returns `200 OK` and file contents.
5. **Non-Existent Document Handling:** `GET /api/documents/view?file=missing_record.txt` correctly returns `404 Not Found`.

### 5.2 Verification Evidence Output Log
```text
================================================================================
ISEC3004 ASSIGNMENT 1: NORMAL USE BEHAVIOUR VERIFICATION
Name: Aadhil Rizwan
 * Role: Vulnerable Application Development Lead
Date & Time: 2026-09-13 01:05:00 UTC
Target Host: http://127.0.0.1:3000
================================================================================

--- TEST 1: System Baseline Health & Status ---
HTTP Status: 200
Response Body:
{"status":"online","system":"ISEC3004 Vulnerable Baseline Portal","version":"1.0.0-vulnerable-baseline","leadDeveloper":"Aadhil (Vulnerable Application Development Lead)"}

--- TEST 2: Legitimate Authentication (Valid User: alice_admin) ---
Request: POST /api/auth/login
Payload: {"username": "alice_admin", "password": "[REDACTED_VALID]"}
HTTP Status: 200 (Expected: 200)
Response Body:
{"status":"success","message":"Authentication successful.","data":{"username":"alice_admin","fullName":"Alice Sterling (System Administrator)","role":"Administrator"}}

--- TEST 3: Legitimate Authentication Rejection (Invalid Password) ---
Request: POST /api/auth/login
Payload: {"username": "alice_admin", "password": "WrongPassword999!"}
HTTP Status: 401 (Expected: 401)
Response Body:
{"status":"fail","message":"Invalid username or password."}

--- TEST 4: Legitimate Document Retrieval (audit_report_2026.txt) ---
Request: GET /api/documents/view?file=audit_report_2026.txt
HTTP Status: 200 (Expected: 200)
Document Head (First 5 lines):
================================================================================
ISEC3004 ENTERPRISE SECURITY AUDIT REPORT - 2026
Permitted Demonstration Document (Classification: Internal Public)
================================================================================

--- TEST 6: Legitimate Rejection of Non-Existent Document ---
Request: GET /api/documents/view?file=missing_record_xyz.txt
HTTP Status: 404 (Expected: 404)
Response Body:
{"status":"fail","message":"Requested document not found."}

================================================================================
ALL NORMAL USE TESTS COMPLETED SUCCESSFULLY.
Application baseline is verified, stable, and ready for team handoff.
================================================================================
```

---

## 6. Code Comments & Design Notes Summary

Every critical section of the codebase was annotated with comprehensive comments explaining:
- The **intended business logic** and expected parameter types.
- The **specific line and syntactic mechanism** causing the security flaw.
- Structured **tracing hooks** (`[AUTH-TRACE]` and `[DOC-TRACE]`) designed specifically to assist **Sachin** during log analysis.
- Clear **handoff guidance** for **Kav** (exploit payloads) and **Shaheem** (remediation strategies).

This modular, well-commented design ensures our team can demonstrate the system during the live presentation seamlessly.
