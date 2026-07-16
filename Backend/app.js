// app.js - builds and exports the Express application.
// server.js imports this and starts the HTTP server.
// Keeping them separate makes testing easier - you can import app without
// binding to a port.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const config = require('./src/config/env');
const authRoutes = require('./src/routes/authRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const postRoutes = require('./src/routes/postRoutes');
const circleRoutes = require('./src/routes/circleRoutes');
const { errorMiddleware, notFoundMiddleware } = require('./src/middleware/errorMiddleware');

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      config.clientUrl,
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Request parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ─── Logging (only in development) ───────────────────────────────────────────
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// ─── Global rate limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});
app.use('/api', globalLimiter);

// ─── Static file serving (local uploads while STORAGE_PROVIDER=local) ─────────
app.use('/uploads', express.static(path.join(__dirname, config.storage.localUploadDir)));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/circles', circleRoutes);

// ─── 404 handler (after all routes) ──────────────────────────────────────────
app.use(notFoundMiddleware);

// ─── Centralized error handler (must be last, after 404) ─────────────────────
app.use(errorMiddleware);

module.exports = app;