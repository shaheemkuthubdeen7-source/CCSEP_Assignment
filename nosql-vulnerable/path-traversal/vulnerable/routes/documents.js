/**
 * Document Archive Controller
 * Author: Aadhil Rizwan
 * 
 * Handles retrieval and downloading of compliance and audit reports.
 * 
 * Intended Purpose:
 * Serves permitted text documents strictly from the internal public/documents directory.
 * 
 * Security Risk (Vulnerability):
 * Constructs the target path using path.join() with unvalidated client input.
 * Because path.join() normalizes relative path tokens without verifying that the
 * resolved absolute path remains within the base directory boundary, passing '../'
 * sequences allows directory traversal to access arbitrary files on the system.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Base directory for permitted documents
const PERMITTED_DOCUMENT_DIR = path.join(__dirname, '../public/documents');

// GET /api/documents/list
// Returns available documents in the public repository
router.get('/list', (req, res) => {
  try {
    const files = fs.readdirSync(PERMITTED_DOCUMENT_DIR).filter(file => file.endsWith('.txt'));
    return res.status(200).json({
      status: 'success',
      allowedDirectory: 'public/documents/',
      documents: files
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Could not read document directory.' });
  }
});

// GET /api/documents/view?file=filename
// Fetches document content by filename
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
  const targetFilePath = path.join(PERMITTED_DOCUMENT_DIR, fileName);

  // Request tracing and auditing
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const isTraversalAttempt = fileName.includes('..') || fileName.includes('/') || fileName.includes('\\');
  
  console.log(`[DOC] [${new Date().toISOString()}] Access request from IP: ${clientIp}`);
  console.log(`[DOC] File param: "${fileName}" | Target: "${targetFilePath}" | Traversal flag: ${isTraversalAttempt}`);

  // Read file from disk
  fs.readFile(targetFilePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log(`[DOC] File not found: ${targetFilePath}`);
        return res.status(404).json({
          status: 'fail',
          message: 'Requested document not found.'
        });
      }
      console.error(`[DOC] File read error: ${err.message}`);
      return res.status(500).json({
        status: 'error',
        message: 'Error reading requested file from system.'
      });
    }

    console.log(`[DOC] Served file: ${targetFilePath} (${Buffer.byteLength(data, 'utf8')} bytes)`);
    
    // Return JSON if requested by client
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(200).json({
        status: 'success',
        fileName: fileName,
        resolvedPath: targetFilePath,
        content: data
      });
    }

    // Default plain text response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(data);
  });
});

module.exports = router;
