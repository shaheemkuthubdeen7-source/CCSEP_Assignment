/**
 * Security-enhanced Document Archive Controller
 * Vulnerable baseline: Aadhil Rizwan
 * Mitigation: Shaheem
 *
 * Mitigation goal:
 * Keep all user-requested document access inside demo-files by validating
 * the filename and verifying the resolved path remains within the permitted base.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const PERMITTED_DOCUMENT_DIR = path.resolve(__dirname, '../demo-files');

router.get('/list', (req, res) => {
  try {
    const files = fs.readdirSync(PERMITTED_DOCUMENT_DIR).filter(file => file.endsWith('.txt'));
    return res.status(200).json({
      status: 'success',
      allowedDirectory: 'demo-files/',
      documents: files
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Could not read document directory.' });
  }
});

router.get('/view', (req, res) => {
  const fileName = req.query.file;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (typeof fileName !== 'string' || fileName.length === 0) {
    console.log(`[DOC-SECURE] [${new Date().toISOString()}] Rejected invalid/missing file parameter from IP: ${clientIp}`);
    return res.status(400).json({
      status: 'error',
      message: "A valid 'file' query parameter is required."
    });
  }

  // Only a single filename is expected. Reject path separators and dot-segment
  // path components before filesystem access.
  if (path.basename(fileName) !== fileName || fileName.includes('/') || fileName.includes('\\')) {
    console.log(`[DOC-SECURE] [${new Date().toISOString()}] Blocked path component from IP: ${clientIp} | file="${fileName}"`);
    return res.status(403).json({
      status: 'fail',
      message: 'Requested path is outside the permitted document directory.'
    });
  }

  // This demonstration repository only serves the intended .txt documents.
  if (path.extname(fileName).toLowerCase() !== '.txt') {
    console.log(`[DOC-SECURE] [${new Date().toISOString()}] Blocked disallowed extension from IP: ${clientIp} | file="${fileName}"`);
    return res.status(403).json({
      status: 'fail',
      message: 'Only permitted text documents may be retrieved.'
    });
  }

  const targetFilePath = path.resolve(PERMITTED_DOCUMENT_DIR, fileName);
  const permittedPrefix = PERMITTED_DOCUMENT_DIR + path.sep;

  // Defence in depth: even after filename validation, verify the canonical
  // absolute target remains inside the permitted directory boundary.
  if (!targetFilePath.startsWith(permittedPrefix)) {
    console.log(`[DOC-SECURE] [${new Date().toISOString()}] Boundary check blocked request from IP: ${clientIp} | target="${targetFilePath}"`);
    return res.status(403).json({
      status: 'fail',
      message: 'Requested path is outside the permitted document directory.'
    });
  }

  console.log(`[DOC-SECURE] [${new Date().toISOString()}] Valid document request from IP: ${clientIp}`);
  console.log(`[DOC-SECURE] File param: "${fileName}" | Target: "${targetFilePath}" | Boundary check: PASS`);

  fs.readFile(targetFilePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log(`[DOC-SECURE] File not found: ${targetFilePath}`);
        return res.status(404).json({
          status: 'fail',
          message: 'Requested document not found.'
        });
      }
      console.error(`[DOC-SECURE] File read error: ${err.message}`);
      return res.status(500).json({
        status: 'error',
        message: 'Error reading requested file.'
      });
    }

    console.log(`[DOC-SECURE] Served permitted file: ${targetFilePath} (${Buffer.byteLength(data, 'utf8')} bytes)`);

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(200).json({
        status: 'success',
        fileName,
        content: data
      });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(data);
  });
});

module.exports = router;
