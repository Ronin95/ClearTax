import express from 'express';
import cors from 'cors';
import { initDB } from './db.ts';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.ts';
import landingRoutes from './routes/landingRoutes.ts';

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Auth Routes
app.use('/api/auth', authRoutes);

// Landing Page Routes
app.use('/api/landingPage', landingRoutes);

const start = async () => {
  await initDB();
  app.listen(3000, '0.0.0.0', () => {
    console.log("🚀 Server running on http://localhost:3000");
  });
};

start();
