import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

import authRoutes from './routes/auth.routes';
import unitsRoutes from './routes/units.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import rentRoutes from './routes/rent.routes';
import dashboardRoutes from './routes/dashboard.routes';
import alertsRoutes from './routes/alerts.routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/rent', rentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
