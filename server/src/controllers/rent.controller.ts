import { Request, Response } from 'express';
import { recordRentSchema, bulkRentSchema } from '../validators/rent.schemas';
import * as rentService from '../services/rent.service';

export async function recordPayment(req: Request, res: Response): Promise<void> {
  try {
    const input = recordRentSchema.parse(req.body);
    const result = await rentService.recordPayment(input, req.user!.id);
    res.status(201).json({ data: result });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function bulkRecord(req: Request, res: Response): Promise<void> {
  try {
    const input = bulkRentSchema.parse(req.body);
    const result = await rentService.bulkRecordPayments(input, req.user!.id);
    res.json(result);
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function getRentStatus(req: Request, res: Response): Promise<void> {
  try {
    const month = req.query.month as string | undefined;
    const status = await rentService.getRentStatus(month);
    res.json({ data: status });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function exportCSV(req: Request, res: Response): Promise<void> {
  try {
    const month = req.query.month as string | undefined;
    const csv = await rentService.exportRentRoll(month);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="rent-roll.csv"');
    res.send(csv);
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}
