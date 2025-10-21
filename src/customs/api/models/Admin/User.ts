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
  menu: any[];
  groupAccess: GroupAccess[];
  status: number;
};

export const CreateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  fullname: z.string().min(3).optional(),
  description: z.string().optional(),
  access: z.string().optional(),
  
  employee_id: z.string().optional(),
  distributor_id: z.string().optional(),
  groupAccess: z
    .array(
      z.object({
        group_id: z.string().uuid().optional(),
        access_code: z.string().optional(),
        is_private: z.number().optional(),
        userId: z.string().nullable().optional(),
        id: z.string().uuid().optional(),
        status: z.number().optional(),
      }),
    )
    .optional(),
  status: z.number().optional(),
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  fullname: z.string().min(3).optional(),
  description: z.string().optional(),
  access: z.string().optional(),
  employee_id: z.string().optional(),
  distributor_id: z.string().optional(),
  groupAccess: z
    .array(
      z.object({
        group_id: z.string().uuid().optional(),
        access_code: z.string().optional(),
        is_private: z.number().optional(),
        userId: z.string().nullable().optional(),
        id: z.string().uuid().optional(),
        status: z.number().optional(),
      }),
    )
    .optional(),
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
