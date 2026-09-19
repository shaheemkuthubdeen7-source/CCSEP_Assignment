/**
 * User Model
 * Author: Aadhil Rizwan
 * 
 * Schema definition for application users stored in MongoDB.
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Administrator', 'Security Analyst', 'Auditor', 'Staff'],
    default: 'Staff'
  },
  department: {
    type: String,
    default: 'IT Operations'
  },
  accountStatus: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
