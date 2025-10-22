import { z } from 'zod';


export type Item = {
  id: string;
  application_id: string;
  organization_id: string;
  organization_Name: string;
  group_id: string;
  group_name: string;
  email: string;
  username: string;
  fullname: string;
  description: string;
  access: string;
  employee_id: string;
  distributor_id: string;
  status: number;
};

export const CreateUserAdminSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  fullname: z.string().min(3).optional(),
  description: z.string().optional(),
  access: z.string().optional(),
  employee_id: z.string().optional(),
  distributor_id: z.string().optional(),
  status: z.number().optional(),
});

export type CreateUserAdminRequest = z.infer<typeof CreateUserAdminSchema>;

export const UpdateUserAdminSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  fullname: z.string().min(3).optional(),
  description: z.string().optional(),
  access: z.string().optional(),
  employee_id: z.string().optional(),
  distributor_id: z.string().optional(),
  status: z.number().optional(),
});

export type UpdateUserAdminRequest = z.infer<typeof UpdateUserAdminSchema>;

export interface CreateUserAdminResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}

export type GetAllUserAdminResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetUserAdminByIdResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

export type GetAllUserAdminPaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};
