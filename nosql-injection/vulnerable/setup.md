# NoSQL Injection - Vulnerable Application Setup

**Developer:** Aadhil Rizwan (Vulnerable Application Development Lead)  
**Target Vulnerability:** NoSQL Query Selector Injection  
**Target Endpoint:** `POST /api/auth/login`  
**Insecure File & Line:** `routes/auth.js:44`  

---

## 1. Overview

This service implements a corporate user authentication portal backed by MongoDB. The authentication handler parses JSON request bodies without verifying that input values are strings. Supplying MongoDB query operator objects (e.g., `{"$ne": ""}`) bypasses password verification.

---

## 2. Prerequisites

- **Node.js**: v18 or higher (v20+ recommended)
- **npm**: v9 or higher
- **MongoDB**: (Optional) Running locally on default port `27017`. If MongoDB is not running, the application automatically launches an embedded in-memory MongoDB instance (`mongodb-memory-server`) with auto-seeding.

---

## 3. Installation & Execution

From the repository root or the `nosql-injection/vulnerable` directory:

```bash
cd nosql-injection/vulnerable

# 1. Install dependencies
npm install

# 2. (Optional) Seed the database
npm run seed

# 3. Start the application
npm start
```

The service will start on:
```text
http://localhost:3000
```

---

## 4. Default Demonstration Accounts

| Username | Password | Role | Department |
| :--- | :--- | :--- | :--- |
| `alice_admin` | `AdminSecret#2026` | Administrator | IT Security |
| `bob_analyst` | `AuditPass!99` | Security Analyst | SOC |
| `charlie_guest` | `GuestWelcome123` | Auditor | Compliance |

---







## 5. Verification Commands





### A. Legitimate Authentication (Normal Use)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice_admin", "password": "AdminSecret#2026"}'
```
*Expected Status:* `200 OK` (returns authenticated user profile and session token).



### B. Automated Test Suite
```bash
bash scripts/verify_normal.sh
```
Runs the automated normal-use test suite and logs output to `docs/evidence/normal_use_evidence.txt`.
