import { z } from 'zod';

export const recordRentSchema = z.object({
  unitId: z.string().uuid('Valid unit ID required.'),
  amount: z.number().min(0, 'Amount must be >= 0.'),
  paymentMonth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Payment month must be YYYY-MM-DD format.'),
});

export const bulkRentSchema = z.object({
  paymentMonth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Payment month must be YYYY-MM-DD format.'),
  payments: z.array(
    z.object({
      unitIdentifier: z.string().min(1, 'Unit identifier is required.'),
      amount: z.number().min(0, 'Amount must be >= 0.'),
    })
  ).min(1, 'At least one payment required.'),
});

export const rentQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type RecordRentInput = z.infer<typeof recordRentSchema>;
export type BulkRentInput = z.infer<typeof bulkRentSchema>;
export type RentQuery = z.infer<typeof rentQuerySchema>;
