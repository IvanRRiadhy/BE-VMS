import { z } from 'zod';

export type Item = {
  id: string;
  name: string;
  description: string;
  homepage: string;
  role_access: string;
  level_priority: string;
};

export const CreateUserGroupSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  homepage: z.string().optional(),
  role_access: z.string().optional(),
});

export type CreateUserRequest = z.infer<typeof CreateUserGroupSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  homepage: z.string().optional(),
  role_access: z.string().optional(),
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
