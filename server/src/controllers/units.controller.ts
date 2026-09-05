import { Request, Response } from 'express';
import { createUnitSchema, updateUnitSchema } from '../validators/unit.schemas';
import * as unitsService from '../services/units.service';

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const units = await unitsService.listUnits(includeArchived);
    res.json({ data: units });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const unit = await unitsService.getUnitById(id);
    res.json({ data: unit });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const input = createUnitSchema.parse(req.body);
    const unit = await unitsService.createUnit(input);
    res.status(201).json({ data: unit });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const input = updateUnitSchema.parse(req.body);
    const id = req.params.id as string;
    const unit = await unitsService.updateUnit(id, input);
    res.json({ data: unit });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function archive(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const unit = await unitsService.archiveUnit(id);
    res.json({ data: unit });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}

export async function restore(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const unit = await unitsService.restoreUnit(id);
    res.json({ data: unit });
  } catch (err: any) { res.status(err.status || 500).json({ message: err.message }); }
}
