import { z } from 'zod';

//TYPE
export type Item = {
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
  qr_code: string;
  faceimage: string;
  access_area: string;
  access_area_special: string;
  birth_date: string; // ISO date format, e.g. "2025-06-16"
  join_date: string;
  exit_date: string;
  is_head: boolean;
  head_employee_1: string;
  head_employee_2: string;
  organization_id: string;
  department_id: string;
  district_id: string;
  is_email_verify: boolean;
  id: string;
};

//GET
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


//CREATE
export const CreateEmployeeRequestSchema = z.object({
  person_id: z.string().default(''),
  identity_id: z.string().default(''),
  card_number: z.string().default(''),
  ble_card_number: z.string().default(''),
  type: z.number().default(0),
  name: z.string().default(''),
  phone: z.string().default(''),
  email: z.string().default(''),
  gender: z.number().default(0),
  address: z.string().default(''),
  upload_fr: z.number().default(0),
  qr_code: z.string().default(''),
  faceimage: z.string().default(''),
  access_area: z.string().default(''),
  access_area_special: z.string().default(''),
  birth_date: z.string().default(''),
  join_date: z.string().default(''),
  exit_date: z.string().default(''),
  is_head: z.boolean().default(false),
  head_employee_1: z.string().default(''),
  head_employee_2: z.string().default(''),
  organization_id: z.string().default(''),
  department_id: z.string().default(''),  
  district_id: z.string().default(''),
})

export type CreateEmployeeRequest = z.infer<typeof CreateEmployeeRequestSchema>;

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
  qr_code: string;
  access_area: string;
  access_area_special: string;
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