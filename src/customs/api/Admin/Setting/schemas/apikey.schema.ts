// api/admin/setting/schemas/apiKey.schema.ts

import { z } from 'zod';

export const ApiKeySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),

  description: z.string().trim(),

  is_active: z.boolean(),

  expired_at: z
    .string()
    .min(1, 'Expired date is required')
    .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Invalid expired date'),

  modules: z.array(z.string().trim().min(1)).min(1, 'At least one module is required'),
});

export type ApiKeyFormData = z.infer<typeof ApiKeySchema>;
