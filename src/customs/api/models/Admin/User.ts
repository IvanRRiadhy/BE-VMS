import { z } from 'zod';
export type GroupAccess = {
  group_id: string;
  access_code: string;
  is_private: number;
  userId: string | null;
  id: string;
  status: number;
};

export type Item = {
  id: string;
  application_id: string;
  organization_id: string;
  group_id: string;
  email: string;
  username: string;
  fullname: string;
  description: string;
  access: string;
  employee_id: string;
  distributor_id: string;
  is_employee: number;
  menu: any[];
  status: number;
};

export const CreateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  fullname: z.string().min(3).optional(),
  description: z.string().optional(),
  access: z.string().optional(),
  password: z.string().optional(),
  group_id: z.string().optional(),
  employee_id: z.string().optional(),
  distributor_id: z.string().optional(),
  organization_id: z.string().optional(),
  is_employee: z.number().optional(),
  status: z.number().optional(),
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  fullname: z.string().min(3).optional(),
  description: z.string().optional(),
  organization_id: z.string().optional(),
  access: z.string().optional(),
  employee_id: z.string().optional(),
  distributor_id: z.string().optional(),
  status: z.number().optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;

export interface CreateUserResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}

export type GetAllUserResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetUserByIdResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

export type GetAllUserPaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};
