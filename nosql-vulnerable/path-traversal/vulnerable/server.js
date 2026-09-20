/**
 * Application Entrypoint
 * Author: Aadhil Rizwan
 * 
 * Sets up Express middleware, API routes, and database initialization.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');

// Route handlers
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing and security middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'ISEC3004 Security Lab Application',
    version: '1.0.0',
    developer: 'Aadhil Rizwan',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Seed default test accounts if the collection is empty
async function autoSeedIfEmpty() {
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('[SERVER] User collection is empty. Populating seed accounts...');
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
    await User.insertMany(SEED_USERS);
    console.log('[SERVER] Seed accounts initialized.');
  }
}

// Connect to database and start server
async function startServer() {
  await connectDB();
  await autoSeedIfEmpty();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[SERVER] Startup failed:', err);
});
