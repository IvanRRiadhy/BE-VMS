import { z } from 'zod';

export type Item = {
  id: string;
  remarks: string;
  name: string;
  type: string;
  card_number: string;
  card_mac: string;
  card_barcode: string;
  is_employee_used?: boolean | null;
  employee_id?: string | null;
  employee_name?: string | null;
  is_multi_site?: boolean | null;
  registered_site?: string | null;
  site_name: string | null;
  is_used?: boolean | null;
  last_used_by?: string | null;
  last_checkin_site?: string | null;
  last_checkout_site?: string | null;
  card_status: number;
  checkin_at?: string | null;
  checkout_at?: string | null;
};

export type GetAllVisitorCardResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetGetVisitorCardByIdResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

export type GetAvailableCardResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetAllVisitorCardPaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

// Create Schema
export const CreateVisitorCardRequestSchema = z.object({
  remarks: z.string().default(''),
  name: z.string().default(''),
  type: z.preprocess((val) => {
    if (val == null) return null;

    const map: Record<string, number> = {
      'non access card': 0,
      'rfid card': 1,
      rfid: 1,
      ble: 2,
    };

    if (typeof val === 'string') {
      const lower = val.toLowerCase();
      if (lower in map) return map[lower];
      const parsed = Number(val);
      return Number.isNaN(parsed) ? null : parsed;
    }

    if (typeof val === 'number') return val;

    return null;
  }, z.number().nullable()),
  card_number: z.string().default(''),
  card_mac: z.string().default(''),
  card_barcode: z.string().default(''),
  is_employee_used: z.boolean().nullable().optional(),
  employee_id: z.string().nullable().optional(),
  employee_name: z.string().nullable().optional(),
  is_multi_site: z.boolean().default(false),
  registered_site: z.string().nullable().optional(),
  is_used: z.boolean().nullable().optional(),
  card_status: z.number().default(0),
  checkin_at: z.string().nullable().optional(),
  checkout_at: z.string().nullable().optional(),
  last_checkin_site: z.string().nullable().optional(),
  last_checkout_site: z.string().nullable().optional(),
  last_used_by: z.string().nullable().optional(),
  site_name: z.string().nullable().optional(),
});

export type CreateVisitorCardRequest = z.infer<typeof CreateVisitorCardRequestSchema>;

export const CreateVisitorCardSubmitSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    remarks: z.string().min(1, { message: 'Remarks is required' }),
    // toggle
    is_employee_used: z.boolean().optional(),
    employee_id: z.string().nullable().optional(),

    // multi-site toggle
    is_multi_site: z.boolean().optional(),
    registered_site: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // 🔹 Validasi employee
    if (data.is_employee_used && !data.employee_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Employee is required',
        path: ['employee_id'], // taruh error di field employee_id
      });
    }

    // 🔹 Validasi site space
    if (!data.is_multi_site && !data.registered_site) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Site is required',
        path: ['registered_site'],
      });
    }
  });

export const UpdateVisitorCardRequestSchema = z.object({
  remarks: z.string().optional(),
  name: z.string().optional(),
  type: z.number().optional(),
  card_number: z.string().optional(),
  card_mac: z.string().optional(),
  card_barcode: z.string().optional(),
  is_employee_used: z.boolean(),
  employee_id: z.string(),
  employee_name: z.string().optional(),
  is_multi_site: z.boolean().optional(),
  registered_site: z.string().nullable().optional(),
  is_used: z.boolean().nullable().optional(),
  card_status: z.number().optional(),
  checkin_at: z.string().nullable().optional(),
  checkout_at: z.string().nullable().optional(),
  last_checkin_site: z.string().nullable().optional(),
  last_checkout_site: z.string().nullable().optional(),
  last_used_by: z.string().nullable().optional(),
  site_name: z.string().nullable().optional(),
});

export type UpdateVisitorCard = z.infer<typeof UpdateVisitorCardRequestSchema>;

export const UpdateVisitorCardBatchSchema = UpdateVisitorCardRequestSchema.partial().superRefine(
  (data: any, ctx: any) => {
    // 🔹 employee
    if (data.is_employee_used === true && !data.employee_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Employee is required',
        path: ['employee_id'],
      });
    }

    // 🔹 site
    if (data.is_multi_site === false && !data.registered_site) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Site is required',
        path: ['registered_site'],
      });
    }
  },
);

export type UpdateBatchCardSchema = z.infer<typeof UpdateVisitorCardBatchSchema>;

// export type UpdateVisitorCardRequest = z.infer<typeof UpdateVisitorCardRequestSchema>;
export interface UpdateVisitorCardRequest {
  remarks?: string;
  name?: string;
  type?: number;
  card_number?: string;
  card_mac?: string;
  card_barcode?: string;
  is_employee_used: boolean | null;
  employee_id: string;
  employee_name?: string;
  is_multi_site: boolean;
  registered_site: string | null;
  is_used?: boolean;
  card_status?: number;
  checkin_at?: string;
  checkout_at?: string;
  last_checkin_site?: string;
  last_checkout_site?: string;
  last_used_by?: string;
  site_name?: string;
}

export interface UpdateVisitorCardResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}

export interface CreateVisitorCardResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}

export interface ValidationErrorResponse {
  type: string;
  title: string;
  status: number;
  errors: {
    [field: string]: string[];
  };
  traceId?: string;
}

export type DeleteVisitorCardResponse<T extends string = string> = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  data: T | null;
};
