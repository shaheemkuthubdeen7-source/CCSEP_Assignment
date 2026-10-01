/**
 * Security-enhanced Authentication Controller
 * Vulnerable baseline: Aadhil Rizwan
 * Mitigation: Shaheem
 *
 * Mitigation goal:
 * Prevent NoSQL operator injection by enforcing the expected JSON schema before
 * any user-controlled values are passed to MongoDB/Mongoose.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

const MAX_USERNAME_LENGTH = 64;
const MAX_PASSWORD_LENGTH = 128;

function isValidCredentialString(value, maxLength) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  console.log(`[AUTH-SECURE] [${new Date().toISOString()}] Login attempt from IP: ${clientIp}`);
  console.log(`[AUTH-SECURE] Input types: username=[${typeof username}], password=[${typeof password}]`);

  if (username === undefined || password === undefined) {
    console.log('[AUTH-SECURE] Rejected: required credential missing.');
    return res.status(400).json({
      status: 'error',
      message: 'Both username and password parameters are required.'
    });
  }

  // Core mitigation: login credentials must be primitive strings, not objects,
  // arrays, or other structures that MongoDB could interpret as query syntax.
  if (!isValidCredentialString(username, MAX_USERNAME_LENGTH) ||
      !isValidCredentialString(password, MAX_PASSWORD_LENGTH)) {
    console.log('[AUTH-SECURE] Rejected: invalid credential type or length.');
    return res.status(400).json({
      status: 'error',
      message: 'Username and password must be valid strings.'
    });
  }

  const safeUsername = username.trim();
  if (safeUsername.length === 0) {
    console.log('[AUTH-SECURE] Rejected: username is empty after trimming.');
    return res.status(400).json({
      status: 'error',
      message: 'Username and password must be valid strings.'
    });
  }

  try {
    // At this point both values are validated primitives. MongoDB receives
    // literal string equality conditions rather than attacker-controlled
    // operator objects such as { "$ne": "" }.
    const queryFilter = {
      username: safeUsername,
      password: password
    };

    console.log('[AUTH-SECURE] Executing validated equality query for username:', safeUsername);

    const user = await User.findOne(queryFilter);

    if (!user) {
      console.log(`[AUTH-SECURE] Login failed for user: ${safeUsername}`);
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid username or password.'
      });
    }

    console.log(`[AUTH-SECURE] Login successful: ${user.username} (${user.role})`);
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
    console.error('[AUTH-SECURE] Query error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication.'
    });
  }
});

// GET /api/auth/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username fullName role department');
    res.status(200).json({ status: 'success', data: users });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
