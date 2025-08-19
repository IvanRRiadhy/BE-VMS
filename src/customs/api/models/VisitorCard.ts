import { z } from 'zod';

export type Item = {
  id: string;
  remarks: string;
  name: string;
  type: number;
  card_number: string;
  card_mac: string;
  card_barcode: string;
  is_employee_used?: boolean | null;
  employee_id: string | null;
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
  type: z.number().default(0),
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

export const UpdateVisitorCardRequestSchema = z.object({
  remarks: z.string().optional(),
  name: z.string().optional(),
  type: z.number().optional(),
  card_number: z.string().optional(),
  card_mac: z.string().optional(),
  card_barcode: z.string().optional(),
  is_employee_used: z.boolean().optional(),
  employee_id: z.string().optional(),
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

// export type UpdateVisitorCardRequest = z.infer<typeof UpdateVisitorCardRequestSchema>;
export interface UpdateVisitorCardRequest {
  remarks?: string;
  name?: string;
  type?: number;
  card_number?: string;
  card_mac?: string;
  card_barcode?: string;
  is_employee_used: boolean;
  employee_id: string;
  employee_name?: string;
  is_multi_site: boolean;
  registered_site: string;
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
