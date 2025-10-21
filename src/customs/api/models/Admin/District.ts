import { z } from 'zod';

// UPDATE
export interface UpdateDistrictRequest {
  code: string;
  name: string;
  host: string;
}

export interface UpdateDistrictResponse {
  status: string; // "success"
  status_code: number; // 200
  title: string;
  msg: string;
  collection: {
    code: string;
    host: string;
    name: string;
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
export type DeleteDistrictResponse<T = any> = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: T | null;
};

// GET ALL PAGINATION
export type Item = {
  code: string;
  name: string;
  host: string;
  id: string;
};

export type GetAllDistrictsPaginationResponse = {
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

export const CreateDistrictSchema = z.object({
  code: z.string().default(''),
  name: z.string().default(''),
  host: z.string().default(''),
});

export type CreateDistrictRequest = z.infer<typeof CreateDistrictSchema>;

export const CreateDistrictSubmitSchema = CreateDistrictSchema.extend({
  code: z.string().trim().min(1, 'District code is required'),
  name: z.string().trim().min(1, 'District name is required'),
  host: z.string().trim().min(1, 'Head of district is required'),
});

export type CreateDistrictSubmitRequest = z.infer<typeof CreateDistrictSubmitSchema>;

export interface CreateDistrictResponse {
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

// get by id
export interface GetDistrictByIdResponse {
  status: string; // "success"
  status_code: number; // 200
  title: string;
  msg: string;
  collection: Item | null;
}
