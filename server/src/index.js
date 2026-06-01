import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import { isMongoEnabled } from './models/Schemas.js';

// Env variables pre-loaded

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to enable Vite local queries
app.use(cors({
  origin: '*', // Allow standard API fetches
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] 🌌 ${req.method} ${req.url}`);
  next();
});

// Database Connectivity Check
const initializeDb = async () => {
  if (isMongoEnabled()) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('🛸 CONNECTED successfully to MongoDB Atlas cluster');
    } catch (err) {
      console.error('⚠️ MongoDB Atlas Connection Failure:', err.message);
      console.log('🔮 DOCKING BACK TO LOCAL Persistent JSON DB engine...');
      process.env.MONGODB_URI = 'local';
    }
  } else {
    console.log('🪐 Running VORTEX Server in zero-config offline mode (JSON DB).');
  }
};

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    message: 'Vortex Quantum Engine running at maximum velocity.',
    database: isMongoEnabled() ? 'MongoDB Atlas' : 'Local JSON Persistent Fallback',
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('🔥 Server Fatal:', err.stack);
  res.status(500).json({ error: 'Quantum engine destabilized: Internal Server Error' });
});

// Start Server
app.listen(PORT, async () => {
  await initializeDb();
  console.log(`🚀 VORTEX SERVER ignited on port ${PORT}`);
  console.log(`👉 API endpoint: http://localhost:${PORT}`);
});
