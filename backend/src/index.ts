/**
 * Terminal Portfolio API
 *
 * Express server entry point for the portfolio backend.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { seedDefaults as seedDeployments } from './models/deploymentModel';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Initialize database
initializeDatabase();

// Seed default deployment data
seedDeployments();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// =============================================================================
// MIDDLEWARE
// =============================================================================

// CORS configuration
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// JSON body parser
app.use(express.json({ limit: '1mb' }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });
}

// =============================================================================
// ROUTES
// =============================================================================

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use(errorHandler);

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('Terminal Portfolio API');
  console.log('='.repeat(50));
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET    /health`);
  console.log(`  GET    /api/projects`);
  console.log(`  GET    /api/projects/:slug`);
  console.log(`  POST   /api/projects`);
  console.log(`  PUT    /api/projects/:slug`);
  console.log(`  DELETE /api/projects/:slug`);
  console.log(`  GET    /api/about`);
  console.log(`  PUT    /api/about`);
  console.log(`  GET    /api/deployments`);
  console.log(`  GET    /api/deployments/:serviceKey`);
  console.log(`  POST   /api/deployments/:serviceKey`);
  console.log('='.repeat(50));
});

export default app;
