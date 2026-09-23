require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./config/database');
const apiRouter = require('./routes/api');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const reservationService = require('./services/reservationService');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite Schema & Seed Data
initDatabase();

// CORS setup for dev and production
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in local dev
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check root
app.get('/', (req, res) => {
  res.json({
    app: 'FarmLink India API',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// Mount Main API Router
app.use('/api', apiRouter);

// Periodic sweeper for expired reservations (runs every 5 minutes)
setInterval(() => {
  try {
    const { expiredCount } = reservationService.expireOverdueReservations();
    if (expiredCount > 0) {
      console.log(`[Sweeper] Automatically expired ${expiredCount} overdue reservations.`);
    }
  } catch (err) {
    console.error('[Sweeper Error]:', err);
  }
}, 5 * 60 * 1000);

// Global Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🌾 FarmLink India Backend running at http://localhost:${PORT}`);
  console.log(`📡 API Endpoints mounted at http://localhost:${PORT}/api`);
});

module.exports = { app, server };
