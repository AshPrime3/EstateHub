import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RENT_GRACE_PERIOD_DAYS: parseInt(process.env.RENT_GRACE_PERIOD_DAYS || '5', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
};
