import { z } from 'zod';

export type Item = {
  id: string;
  visitor_type: string;
  is_group: boolean;
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
  question_page: SectionPageVisitor[];
};

export type FormField = {
  id?: string;
  remarks?: string;
  sort?: number;
  short_name?: string;
  long_display_text?: string;
  field_type?: number;
  is_primary?: boolean;
  is_enable?: boolean;
  mandatory?: boolean;
  custom_field_id?: string | null;
  multiple_option_fields?: any[]; // Atau define type lebih spesifik kalau ada\
  visitor_form_type?: number;
  document_id?: string;
  answer_text?: string;
  answer_datetime?: string;
  answer_file?: string;
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

const formVisitorSchema = z.object({
  sort: z.number().optional().default(0),
  short_name: z.string().optional().default(''),
  long_display_text: z.string().optional().default(''),
  field_type: z.number().optional().default(0),
  is_primary: z.boolean().optional().default(false),
  is_enable: z.boolean().optional().default(false),
  mandatory: z.boolean().optional().default(false),
  remarks: z.string().optional().default(''),
  custom_field_id: z.string().optional().default(''),
  multiple_option_fields: z.array(z.any()).optional().default([]),
  visitor_form_type: z.number().optional(),
  answer_text: z.string().optional(),
  answer_datetime: z.string().datetime().optional(), // atau nullable().optional() jika butuh null
  answer_file: z.string().optional(),
});

export type FormVisitor = z.infer<typeof formVisitorSchema>;


const sectionPageVisitorSchema = z.object({
  sort: z.number().default(0),
  name: z.string().default(''),
  status: z.number().default(0).optional(),
  is_document: z.boolean().default(false).optional(),
  can_multiple_used: z.boolean().default(false).optional(),
  self_only: z.boolean().default(false).optional(),
  foreign_id: z.string().default('').optional(),
  form: z.array(formVisitorSchema).default([]),
  // visit_form: z.array(formVisitorSchema).default([]),
  // pra_form: z.array(formVisitorSchema).nullable(),
  // checkout_form: z.array(formVisitorSchema).nullable(),
});

export const visitorItemSchema = z.object({
  question_page: z.array(sectionPageVisitorSchema).default([]),
});

export const CreateVisitorRequestSchema = z.object({
  visitor_type: z.string().default(''),
  type_registered: z.number().default(0).optional(),
  is_group: z.boolean().default(false).optional(),
  data_visitor: z.array(visitorItemSchema).default([]),
});

export type SectionPageVisitor = {
  sort: number;
  name: string;
  is_document?: boolean;
  can_multiple_used?: boolean;
  self_only?: boolean;
  foreign_id?: string;
  form?: FormField[];
};

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
