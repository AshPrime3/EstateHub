import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'PROPERTY_MANAGER' | 'MAINTENANCE_CONTRACTOR';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
