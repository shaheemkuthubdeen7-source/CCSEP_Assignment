/**
 * Database Seed Script
 * Author: Aadhil Rizwan
 * 
 * Clears and populates initial user accounts for testing and verification.
 */

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

const SEED_USERS = [
  {
    username: 'alice_admin',
    password: 'AdminSecret#2026',
    fullName: 'Alice Sterling',
    role: 'Administrator',
    department: 'IT Security'
  },
  {
    username: 'bob_analyst',
    password: 'AuditPass!99',
    fullName: 'Robert Hayes',
    role: 'Security Analyst',
    department: 'SOC'
  },
  {
    username: 'charlie_guest',
    password: 'GuestWelcome123',
    fullName: 'Charles Vance',
    role: 'Auditor',
    department: 'Compliance'
  }
];

async function seed() {
  console.log('[SEED] Connecting to database...');
  await connectDB();

  console.log('[SEED] Clearing existing records...');
  await User.deleteMany({});

  console.log('[SEED] Inserting initial accounts...');
  const inserted = await User.insertMany(SEED_USERS);
  
  console.log(`[SEED] Added ${inserted.length} accounts.`);
  inserted.forEach(u => {
    console.log(`- ${u.username} (${u.role})`);
  });

  await disconnectDB();
  console.log('[SEED] Database connection closed.');
}

seed().catch(err => {
  console.error('[SEED] Error seeding data:', err);
  process.exit(1);
});
