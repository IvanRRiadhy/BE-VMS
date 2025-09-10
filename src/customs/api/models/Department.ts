import { z } from 'zod';

// GET ALL PAGINATION
export type Item = {
  code: string;
  name: string;
  host: string;
  id: string;
};

// UPDATE
export interface UpdateDepartmentRequest {
  code: string;
  name: string;
  host: string;
}

export interface UpdateDepartmentResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: {
    code: string;
    name: string;
    host: string;
    id: string;
  };
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
export type DeleteDepartmentResponse<T = any> = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: T | null;
};

export type GetAllDepartmetsPaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

// CREATE
export const CreateDepartmentSchema = z.object({
  code: z.string().default(''),
  name: z.string().default(''),
  host: z.string().default(''),
});

export type CreateDepartmentRequest = z.infer<typeof CreateDepartmentSchema>;

export const CreateDepartementSubmitSchema = CreateDepartmentSchema.extend({
  code: z.string().trim().min(1, 'Department code is required'),
  name: z.string().trim().min(1, 'Department name is required'),
  // host: z.string().trim().min(1, 'Head of department is required'),
});
export type CreateDepartementSubmitRequest = z.infer<typeof CreateDepartementSubmitSchema>;
export interface CreateDepartmentResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: {
    code: string;
    name: string;
    host: string;
    id: string;
  };
}
