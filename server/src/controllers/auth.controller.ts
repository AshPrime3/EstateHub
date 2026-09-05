import { Request, Response } from 'express';
import { loginSchema } from '../validators/auth.schemas';
import * as authService from '../services/auth.service';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json({ data: result });
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Login failed.' });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ message: 'Not authenticated.' }); return; }
    const user = await authService.getMe(req.user.id);
    res.json({ data: user });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // JWT is stateless — client simply discards the token
  res.json({ message: 'Logged out successfully.' });
}
