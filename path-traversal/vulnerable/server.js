/**
 * Application Entrypoint
 * Author: Aadhil Rizwan
 *
 * Sets up Express middleware and API routes for the
 * intentionally vulnerable path traversal demo app.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

// Route handlers
const documentRoutes = require('./routes/documents');

const app = express();
const PORT = process.env.PORT || 3001;

// Body parsing and security middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'ISEC3004 Security Lab - Path Traversal Demo',
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

app.listen(PORT, () => {
  console.log(`[SERVER] Path Traversal app running at http://localhost:${PORT}`);
});
