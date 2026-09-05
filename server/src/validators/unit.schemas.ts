import { z } from 'zod';

export const createUnitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required.'),
  address: z.string().min(1, 'Address is required.'),
  monthlyRent: z.number().min(0, 'Monthly rent must be >= 0.'),
  tenantName: z.string().min(1, 'Tenant name is required.'),
});

export const updateUnitSchema = z.object({
  unitNumber: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  monthlyRent: z.number().min(0).optional(),
  tenantName: z.string().min(1).optional(),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
