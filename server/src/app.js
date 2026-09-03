const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const hodRoutes = require('./routes/hodRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Middleware ---

// CORS — allow the frontend dev server
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

// --- Routes ---

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/hod', hodRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: 'NOT_FOUND',
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
