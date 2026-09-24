import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './src/middleware/errorMiddleware.js';

import authRoutes from './src/routes/authRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';
import dsaRoutes from './src/routes/dsaRoutes.js';
import aptitudeRoutes from './src/routes/aptitudeRoutes.js';
import csCoreRoutes from './src/routes/csCoreRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import interviewRoutes from './src/routes/interviewRoutes.js';
import resumeRoutes from './src/routes/resumeRoutes.js';
import companyRoutes from './src/routes/companyRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database (non-blocking so server can start and health endpoint remains accessible)
connectDB().catch(err => {
  console.error('[Server] Database initialization failed. Check MONGODB_URI credentials in server/.env');
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/dsa', dsaRoutes);
app.use('/api/v1/aptitude', aptitudeRoutes);
app.use('/api/v1/cs-core', csCoreRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/interview', interviewRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health Check
const healthHandler = (req, res) => {
  res.json({
    status: 'healthy',
    message: 'AI Placement Coach API is online',
    app: 'AI Placement Coach API',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
};
app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] AI Placement Coach Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
