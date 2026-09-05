import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err.message);

  if (err instanceof ZodError) {
    res.status(422).json({
      message: 'Validation error.',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Don't expose stack traces in production
  const message = env.NODE_ENV === 'production' ? 'Internal server error.' : err.message;
  res.status(500).json({ message });
};
