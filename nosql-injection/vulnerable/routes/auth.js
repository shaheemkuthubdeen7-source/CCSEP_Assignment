/**
 * Authentication Controller
 * Author: Aadhil Rizwan
 * 
 * Handles user authentication and session management.
 * 
 * Intended Purpose:
 * Verifies credentials against the User collection in MongoDB and returns
 * profile and session information upon successful match.
 * 
 * Security Risk (Vulnerability):
 * The login handler accepts raw request body parameters without enforcing string type.
 * In Express with express.json(), nested JSON objects are parsed directly. Passing an
 * object (e.g. {"$ne": ""}) into the Mongoose query filter causes MongoDB to treat it as
 * a query selector rather than a literal string, allowing authentication bypass.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Audit logging for authentication events
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`[AUTH] [${new Date().toISOString()}] Login attempt from IP: ${clientIp}`);
  console.log(`[AUTH] Input types: username=[${typeof username}], password=[${typeof password}]`);

  // Ensure required credentials are provided
  if (username === undefined || password === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'Both username and password parameters are required.'
    });
  }

  try {
    // Insecure query filter: untrusted object input is not cast to string or sanitized.
   
    const queryFilter = {
      username: username,
      password: password
    };

    console.log('[AUTH] Executing query:', JSON.stringify(queryFilter));

    const user = await User.findOne(queryFilter);

    if (!user) {
      console.log(`[AUTH] Login failed for user: ${typeof username === 'object' ? JSON.stringify(username) : username}`);
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid username or password.'
      });
    }

    console.log(`[AUTH] Login successful: ${user.username} (${user.role})`);

    return res.status(200).json({
      status: 'success',
      message: 'Authentication successful.',
      data: {
        userId: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        token: `session_token_${user._id}_${Date.now()}`
      }
    });

  } catch (error) {
    console.error('[AUTH] Query error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication.'
    });
  }
});

// GET /api/auth/users
// Helper endpoint to retrieve public directory of users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username fullName role department');
    res.status(200).json({ status: 'success', data: users });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
