import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';

export async function getDashboard(_req: Request, res: Response): Promise<void> {
  try {
    const data = await dashboardService.getDashboardData();
    res.json({ data });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
}
