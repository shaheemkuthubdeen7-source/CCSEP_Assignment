/**
 * Database Connection Module
 * Author: Aadhil Rizwan
 * 
 * Manages MongoDB connectivity via Mongoose.
 * Connects to a local MongoDB instance by default, falling back to an in-memory
 * database instance if local MongoDB is not running.
 */

const mongoose = require('mongoose');

let mongoServerInstance = null;

async function connectDB() {
  const LOCAL_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/isec3004_vulnerable_db';

  try {
    // Attempt connection to local MongoDB
    await mongoose.connect(LOCAL_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log('[DB] Connected to local MongoDB instance.');
  } catch (err) {
    console.warn('[DB] Local MongoDB not available. Starting in-memory fallback...');
    
    // In-memory fallback for portable environments
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServerInstance = await MongoMemoryServer.create();
      const memoryUri = mongoServerInstance.getUri();
      
      await mongoose.connect(memoryUri);
      console.log(`[DB] Connected to in-memory database at ${memoryUri}`);
    } catch (memErr) {
      console.error('[DB] Connection error:', memErr.message);
      process.exit(1);
    }
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoServerInstance) {
    await mongoServerInstance.stop();
  }
}

module.exports = { connectDB, disconnectDB };
