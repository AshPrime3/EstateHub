import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  unitId: z.string().uuid('Valid unit ID required.'),
  description: z.string().min(1, 'Description is required.'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export const updateMaintenanceSchema = z.object({
  description: z.string().min(1).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['REPORTED', 'TRIAGED', 'SCHEDULED', 'RESOLVED']),
});

export const addNoteSchema = z.object({
  note: z.string().min(1, 'Note is required.'),
});

export const assignContractorSchema = z.object({
  contractorId: z.string().uuid('Valid contractor ID required.'),
});

export const maintenanceQuerySchema = z.object({
  search: z.string().optional(),
  unitId: z.string().uuid().optional(),
  status: z.enum(['REPORTED', 'TRIAGED', 'SCHEDULED', 'RESOLVED']).optional(),
  contractorId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  sortBy: z.enum(['createdAt', 'priority', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type AddNoteInput = z.infer<typeof addNoteSchema>;
export type AssignContractorInput = z.infer<typeof assignContractorSchema>;
export type MaintenanceQuery = z.infer<typeof maintenanceQuerySchema>;
