import { z } from 'zod';

export type Item = {
  code: string;
  name: string;
  host: string;
  id: string;
};

// UPDATE
export interface UpdateOrganizationRequest {
  code: string;
  name: string;
  host: string;
}

export interface UpdateOrganizationResponse {
  status: string; // "success"
  status_code: number; // 200
  title: string;
  msg: string;
  collection: {
    name: string;
    host: string;
    code: string;
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

// DELETE
export type DeleteOrganizationResponse<T = any> = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: T | null;
};

// GET ALL PAGINATION
// export type Item = {
//   code: string;
//   name: string;
//   id: string;
// };

export type GetAllOrgaizationsPaginationResponse = {
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

export const CreateOrganizationSchema = z.object({
  code: z.string().default(''),
  name: z.string().default(''),
  host: z.string().default(''),
});

export type CreateOrganizationRequest = z.infer<typeof CreateOrganizationSchema>;

export const CreateOrganizationSubmitSchema = CreateOrganizationSchema.extend({
  code: z.string().trim().min(1, 'Organization code is required'),
  name: z.string().trim().min(1, 'Organization name is required'),
  host: z.string().trim().min(1, 'Head of organization is required'),
});

export type CreateOrganizationSubmitRequest = z.infer<typeof CreateOrganizationSubmitSchema>;

export interface CreateOrganizationResponse {
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
