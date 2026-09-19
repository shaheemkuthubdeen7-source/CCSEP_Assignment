#!/usr/bin/env bash
# Normal Use Verification Script
# Author: Aadhil Rizwan
#
# Validates standard application functionality (authentication and document retrieval)
# before security testing.

SERVER_URL="http://127.0.0.1:3000"
EVIDENCE_FILE="docs/evidence/normal_use_evidence.txt"

mkdir -p docs/evidence

echo "================================================================================" | tee "$EVIDENCE_FILE"
echo "ISEC3004 ASSIGNMENT 1: NORMAL USE VERIFICATION" | tee -a "$EVIDENCE_FILE"
echo "Author: Aadhil Rizwan" | tee -a "$EVIDENCE_FILE"
echo "Date: $(date -u '+%Y-%m-%d %H:%M:%S UTC')" | tee -a "$EVIDENCE_FILE"
echo "Host: $SERVER_URL" | tee -a "$EVIDENCE_FILE"
echo "================================================================================" | tee -a "$EVIDENCE_FILE"
echo "" | tee -a "$EVIDENCE_FILE"

# 1. System Health Check
echo "--- TEST 1: Health Endpoint Check ---" | tee -a "$EVIDENCE_FILE"
HEALTH_RESP=$(curl -s -w "\n%{http_code}" "$SERVER_URL/api/health")
HEALTH_CODE=$(echo "$HEALTH_RESP" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESP" | sed '$d')

echo "HTTP Status: $HEALTH_CODE" | tee -a "$EVIDENCE_FILE"
echo "Response Body:" | tee -a "$EVIDENCE_FILE"
echo "$HEALTH_BODY" | tee -a "$EVIDENCE_FILE"

if [ "$HEALTH_CODE" -ne 200 ]; then
  echo "Error: Server is not running on $SERVER_URL. Start the server first."
  exit 1
fi
echo "" | tee -a "$EVIDENCE_FILE"

# 2. Normal Login with Valid Credentials (alice_admin)
echo "--- TEST 2: Valid Authentication (alice_admin) ---" | tee -a "$EVIDENCE_FILE"
LOGIN_VALID=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "alice_admin", "password": "AdminSecret#2026"}')
LOGIN_VALID_CODE=$(echo "$LOGIN_VALID" | tail -n1)
LOGIN_VALID_BODY=$(echo "$LOGIN_VALID" | sed '$d')

echo "Request: POST /api/auth/login" | tee -a "$EVIDENCE_FILE"
echo "HTTP Status: $LOGIN_VALID_CODE" | tee -a "$EVIDENCE_FILE"
echo "Response Body:" | tee -a "$EVIDENCE_FILE"
echo "$LOGIN_VALID_BODY" | tee -a "$EVIDENCE_FILE"
echo "" | tee -a "$EVIDENCE_FILE"

# 3. Normal Login with Invalid Credentials
echo "--- TEST 3: Invalid Authentication (Rejection) ---" | tee -a "$EVIDENCE_FILE"
LOGIN_INVALID=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "alice_admin", "password": "WrongPassword999!"}')
LOGIN_INVALID_CODE=$(echo "$LOGIN_INVALID" | tail -n1)
LOGIN_INVALID_BODY=$(echo "$LOGIN_INVALID" | sed '$d')

echo "Request: POST /api/auth/login" | tee -a "$EVIDENCE_FILE"
echo "HTTP Status: $LOGIN_INVALID_CODE" | tee -a "$EVIDENCE_FILE"
echo "Response Body:" | tee -a "$EVIDENCE_FILE"
echo "$LOGIN_INVALID_BODY" | tee -a "$EVIDENCE_FILE"
echo "" | tee -a "$EVIDENCE_FILE"

# 4. Normal Document Retrieval (audit_report_2026.txt)
echo "--- TEST 4: Valid Document Retrieval (audit_report_2026.txt) ---" | tee -a "$EVIDENCE_FILE"
DOC1_RESP=$(curl -s -w "\n%{http_code}" "$SERVER_URL/api/documents/view?file=audit_report_2026.txt")
DOC1_CODE=$(echo "$DOC1_RESP" | tail -n1)
DOC1_BODY=$(echo "$DOC1_RESP" | sed '$d')

echo "Request: GET /api/documents/view?file=audit_report_2026.txt" | tee -a "$EVIDENCE_FILE"
echo "HTTP Status: $DOC1_CODE" | tee -a "$EVIDENCE_FILE"
echo "Document Preview:" | tee -a "$EVIDENCE_FILE"
echo "$DOC1_BODY" | head -n 5 | tee -a "$EVIDENCE_FILE"
echo "" | tee -a "$EVIDENCE_FILE"

# 5. Normal Document Retrieval (security_policy_v2.txt)
echo "--- TEST 5: Valid Document Retrieval (security_policy_v2.txt) ---" | tee -a "$EVIDENCE_FILE"
DOC2_RESP=$(curl -s -w "\n%{http_code}" "$SERVER_URL/api/documents/view?file=security_policy_v2.txt")
DOC2_CODE=$(echo "$DOC2_RESP" | tail -n1)
DOC2_BODY=$(echo "$DOC2_RESP" | sed '$d')

echo "Request: GET /api/documents/view?file=security_policy_v2.txt" | tee -a "$EVIDENCE_FILE"
echo "HTTP Status: $DOC2_CODE" | tee -a "$EVIDENCE_FILE"
echo "Document Preview:" | tee -a "$EVIDENCE_FILE"
echo "$DOC2_BODY" | head -n 5 | tee -a "$EVIDENCE_FILE"
echo "" | tee -a "$EVIDENCE_FILE"

# 6. Normal Rejection of Non-existent File
echo "--- TEST 6: Non-Existent Document (404 Rejection) ---" | tee -a "$EVIDENCE_FILE"
DOC_MISS_RESP=$(curl -s -w "\n%{http_code}" "$SERVER_URL/api/documents/view?file=missing_record_xyz.txt")
DOC_MISS_CODE=$(echo "$DOC_MISS_RESP" | tail -n1)
DOC_MISS_BODY=$(echo "$DOC_MISS_RESP" | sed '$d')

echo "Request: GET /api/documents/view?file=missing_record_xyz.txt" | tee -a "$EVIDENCE_FILE"
echo "HTTP Status: $DOC_MISS_CODE" | tee -a "$EVIDENCE_FILE"
echo "Response Body:" | tee -a "$EVIDENCE_FILE"
echo "$DOC_MISS_BODY" | tee -a "$EVIDENCE_FILE"
echo "" | tee -a "$EVIDENCE_FILE"

echo "================================================================================" | tee -a "$EVIDENCE_FILE"
echo "Normal use verification tests completed." | tee -a "$EVIDENCE_FILE"
echo "Evidence written to: $EVIDENCE_FILE" | tee -a "$EVIDENCE_FILE"
echo "================================================================================" | tee -a "$EVIDENCE_FILE"
