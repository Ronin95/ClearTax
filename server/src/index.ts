import express from 'express';
import cors from 'cors';
import { initDB } from './db.ts';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.ts';
import landingRoutes from './routes/landingRoutes.ts';
import userRoutes from './routes/userRoutes.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Auth Routes
app.use('/api/auth', authRoutes);

// Landing Page Routes
app.use('/api/landingPage', landingRoutes);

// User Routes
app.use('/api/users', userRoutes);

const start = async () => {
  await initDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running internally on port ${PORT}`);
  });
};

start();
