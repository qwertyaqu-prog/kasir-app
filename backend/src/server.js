import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import transactionRoutes from './routes/transactions.js';
import reportRoutes from './routes/reports.js';

import { initDatabase } from './database/init.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Kasir Pro API is running', version: '2.0.0' });
});

// Initialize database and start server
async function startServer() {
  await initDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🏪 KASIR PRO - Professional POS System                ║
║                                                          ║
║   📍 Server: http://localhost:${PORT}                      ║
║   🌐 LAN:    http://[YOUR-IP]:${PORT}                     ║
║                                                          ║
║   🔐 Login: admin / admin123                            ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
  });
}

startServer();