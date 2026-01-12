import { z } from 'zod';

//TYPE
export type Item = {
  id: string;
  brand_id: string;
  brand_name: string;
  type: number;
  name: string;
  description: string;
  channel: string;
  door_id: string;
  raw: string;
  integration_id: string;
  integration_name: string;
};

export enum AccessControlType {
  Access = 0,
  Group = 1,
}

//GET
export type GetAllAccessControlResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetAccessControlPaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetAccessControlByIdResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};
//CREATE
export const CreateAccessControlRequestSchema = z.object({
  brand_id: z.string().default(''),
  brand_name: z.string().default(''),
  type: z.number().default(-1),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().default(''),
  channel: z.string().default(''),
  door_id: z.string().default(''),
  raw: z.string().default('{}'),
  integration_id: z.string().min(1, 'Integration is required'),
  integration_name: z.string().default(''),
});

export type CreateAccessControlRequest = z.infer<typeof CreateAccessControlRequestSchema>;

export interface CreateAccessControlResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}

//DELETE
export type DeleteAccessControlResponse<T = any> = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: T | null;
};


export const UpdateAccessControlRequestSchema = z.object({
  brand_id: z.string().default(''),
  brand_name: z.string().default('').optional(),
  type: z.number().default(0),
  name: z.string().default(''),
  description: z.string().default('').optional(),
  channel: z.string().default(''),
  door_id: z.string().default(''),
  raw: z.string().default('{}'),
  integration_id: z.string().default(''),
  integration_name: z.string().default('').optional(),
});

export type UpdateAccessControlRequest = z.infer<typeof UpdateAccessControlRequestSchema>;

export interface UpdateAccessControlResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}
