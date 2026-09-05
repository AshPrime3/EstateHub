import { Request, Response } from 'express';
import { createMaintenanceSchema, updateMaintenanceSchema, updateStatusSchema, addNoteSchema, assignContractorSchema, maintenanceQuerySchema } from '../validators/maintenance.schemas';
import * as maintenanceService from '../services/maintenance.service';

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const query = maintenanceQuerySchema.parse(req.query);
    const result = await maintenanceService.listMaintenance(query, req.user!.id, req.user!.role);
    res.json(result);
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const request = await maintenanceService.getMaintenanceById(id, req.user!.id, req.user!.role);
    res.json({ data: request });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const input = createMaintenanceSchema.parse(req.body);
    const request = await maintenanceService.createMaintenance(input, req.user!.id, req.user!.role);
    res.status(201).json({ data: request });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const input = updateMaintenanceSchema.parse(req.body);
    const id = req.params.id as string;
    const request = await maintenanceService.updateMaintenance(id, input, req.user!.id, req.user!.role);
    res.json({ data: request });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  try {
    const input = updateStatusSchema.parse(req.body);
    const id = req.params.id as string;
    const request = await maintenanceService.updateStatus(id, input.status as any, req.user!.id, req.user!.role);
    res.json({ data: request });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function assignContractor(req: Request, res: Response): Promise<void> {
  try {
    const input = assignContractorSchema.parse(req.body);
    const id = req.params.id as string;
    const assignment = await maintenanceService.assignContractor(id, input.contractorId, req.user!.id);
    res.status(201).json({ data: assignment });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function removeContractor(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const contractorId = req.params.contractorId as string;
    await maintenanceService.removeContractor(id, contractorId, req.user!.id);
    res.json({ message: 'Contractor removed from request.' });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function addNote(req: Request, res: Response): Promise<void> {
  try {
    const input = addNoteSchema.parse(req.body);
    const id = req.params.id as string;
    const event = await maintenanceService.addNote(id, input.note, req.user!.id, req.user!.role);
    res.status(201).json({ data: event });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function getContractors(_req: Request, res: Response): Promise<void> {
  try {
    const contractors = await maintenanceService.getContractors();
    res.json({ data: contractors });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
}
