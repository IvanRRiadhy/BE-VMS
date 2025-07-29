import { z } from 'zod';

export type Item = {
  id: string;
  visitor_type: string;
  identity_id: string;
  name: string;
  email: string;
  gender: number;
  address: string;
  phone: string;
  is_vip: boolean;
  is_email_verified: boolean;
  email_verification_send_at: string;
  email_verification_token: string;
  visitor_period_start: string;
  visitor_period_end: string;
  is_employee: boolean;
  employee_id: string;
};

export type GetAllVisitorPaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export const CreateVisitorRequestSchema = z.object({
  visitor_type: z.string().default(''),
  identity_id: z.string().default(''),
  name: z.string().default(''),
  email: z.string().default(''),
  gender: z.number().default(0),
  address: z.string().default(''),
  phone: z.string().default(''),
  is_vip: z.boolean().default(false),
  is_email_verified: z.boolean().default(false),
  email_verification_send_at: z.string().default(''),
  email_verification_token: z.string().default(''),
  visitor_period_start: z.string().default(''),
  visitor_period_end: z.string().default(''),
  is_employee: z.boolean().default(false),
  employee_id: z.string().default(''),
});

export type CreateVisitorRequest = z.infer<typeof CreateVisitorRequestSchema>;

export interface CreateVisitorResponse {
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

export type DeleteVisitorResponse<T extends string = string> = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: T | null;
};
