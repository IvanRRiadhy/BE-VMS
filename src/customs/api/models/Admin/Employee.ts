import { verify } from 'crypto';
import { z } from 'zod';

//TYPE
export type Item = {
  person_id: string;
  identity_id: string;
  card_number: string;
  ble_card_number: string;
  type: number;
  vehicle_plate_number?: string;
  vehicle_type?: string;
  name: string;
  phone: string;
  email: string;
  gender: number;
  address: string;
  upload_fr: number;
  qr_code: string;
  faceimage: string;
  identity_type: string;
  // access_area: string;
  // access_area_special: string;
  birth_date: string; // ISO date format, e.g. "2025-06-16"
  join_date: string;
  exit_date: string;
  is_head: boolean;
  head_employee_1: string;
  head_employee_2: string;
  organization_id: string;
  department_id: string;
  district_id: string;
  status_employee: number;
  is_email_verify: boolean;
  id: string;
};

//GET

export type GetAllEmployeeResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};
export type GetAllEmployeePaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetAllEmployeeByIdResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

//CREATE
export const CreateEmployeeRequestSchema = z.object({
  person_id: z.string().default(''),
  identity_id: z.string().default(''),
  card_number: z.string().default(''),
  ble_card_number: z.string().default(''),
  type: z.number().default(0),
  vehicle_plate_number: z.string().default(''),
  vehicle_type: z.string().default(''),
  name: z.string().default(''),
  phone: z.string().default(''),
  email: z.string().default(''),
  gender: z.number().default(-1),
  address: z.string().default(''),
  upload_fr: z.number().default(0),
  qr_code: z.string().default(''),
  faceimage: z.string().default(''),
  identity_type: z.string().default(''),
  // access_area: z.string().default(''),
  // access_area_special: z.string().default(''),
  birth_date: z.string().default(''),
  join_date: z.string().default(''),
  exit_date: z.string().default(''),
  is_head: z.boolean().default(false),
  head_employee_1: z.string().default(''),
  head_employee_2: z.string().default(''),
  organization_id: z.string().default(''),
  department_id: z.string().default(''),
  district_id: z.string().default(''),
  // status_employee: z.number().default(-1),
});

export type CreateEmployeeRequest = z.infer<typeof CreateEmployeeRequestSchema>;

export const CreateEmployeeSubmitSchema = CreateEmployeeRequestSchema.extend({
  name: z.string().trim().min(1, 'Employee name is required'),
  identity_id: z.string().trim().min(1, 'Identity ID is required'),
  person_id: z.string().trim().min(1, 'Person ID is required'),
  email: z.string().trim().min(1, 'Email is required'),
  organization_id: z.string().trim().min(1, 'Organization is required'),
  gender: z.coerce
    .number({ required_error: 'Gender is required' })
    .refine((v) => v === 0 || v === 1, { message: 'Gender is required' }),
  department_id: z.string().trim().min(1, 'Department is required'),
  district_id: z.string().trim().min(1, 'District is required'),
  birth_date: z.string().trim().min(1, 'Birth date is required'),
  join_date: z.string().trim().min(1, 'Join date is required'),
  exit_date: z.string().trim().min(1, 'Exit date is required'),
});

export interface CreateEmployeeResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}

//UPDATE
export interface UpdateEmployeeRequest {
  person_id: string;
  identity_id: string;
  card_number: string;
  ble_card_number: string;
  type: number;
  name: string;
  phone: string;
  email: string;
  gender: number;
  address: string;
  upload_fr: number;
  vehicle_plate_number: string;
  vehicle_type: string;
  // faceimage: string;
  identity_type: string;
  qr_code: string;
  // access_area: string;
  // access_area_special: string;
  birth_date: string;
  join_date: string;
  exit_date: string;
  is_head: boolean;
  head_employee_1: string;
  head_employee_2: string;
  organization_id: string;
  department_id: string;
  district_id: string | null;
  is_email_verify: boolean;
}

export interface UpdateEmployeeResponse {
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

//DELETE
export type DeleteEmployeeResponse<T = any> = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: T | null;
};

export const BatchEditSchema = z.object({
  organization_id: z.string(),
  department_id: z.string(),
  district_id: z.string(),
});

export type BatchEditRequest = z.infer<typeof BatchEditSchema>;

export interface UploadImageEmployeeResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}
