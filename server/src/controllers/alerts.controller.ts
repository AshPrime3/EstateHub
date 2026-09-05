import { Request, Response } from 'express';
import * as alertsService from '../services/alerts.service';

export async function getAlerts(_req: Request, res: Response): Promise<void> {
  try {
    const data = await alertsService.getActiveAlerts();
    res.json({ data });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
}

export async function dismissAlert(req: Request, res: Response): Promise<void> {
  try {
    const { paymentMonth } = req.body;
    if (!paymentMonth) { res.status(400).json({ message: 'paymentMonth is required.' }); return; }
    const unitId = req.params.unitId as string;
    const result = await alertsService.dismissAlert(unitId, paymentMonth, req.user!.id);
    res.json(result);
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function getAlertCount(_req: Request, res: Response): Promise<void> {
  try {
    const count = await alertsService.getAlertCount();
    res.json({ data: { count } });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
}
