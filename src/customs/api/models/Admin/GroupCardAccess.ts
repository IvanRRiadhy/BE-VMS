import { z } from 'zod';
export type Item = {
  id: string;
  number_access: number;
  card_id: string;
  name: string;
  description: string;
  access_control_id: string;
  timezone_id: string;
};

export const GroupCardAccessSchema = z.object({
  id: z.string(),
  number_access: z.number().default(0),
  card_id: z.string().default(''),
  name: z.string().default(''),
  description: z.string().default(''),
  access_control_id: z.string().default(''),
  timezone_id: z.string(),
});

export type GroupCardAccess = z.infer<typeof GroupCardAccessSchema>;

export type GetAllGroupCardAccessResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetAllGroupCardAccessPaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type CreateGroupCardAccessResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

export type UpdateGroupCardAccessResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

export type GetGroupCardAccessByIdResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

export type DeleteGroupCardAccessResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};
