import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { connectDB } from './src/config/db.js';
import scanRoutes from './src/routes/scanRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import { notFound, errorHandler } from './src/middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads')); // serves scanned label images

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'metrocheck-backend', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`[server] MetroCheck API running on port ${PORT}`));
  } catch (err) {
    console.error('[startup] failed to start:', err.message);
    process.exit(1);
  }
}

start();
