import { access } from 'fs';
import { string } from 'prop-types';
import { z } from 'zod';

export type Item = {
  id: string;
  sort: number;
  name: string;
  access_control_id: string;
  early_access: string;
  site_name: string;
  integration_id: string;
  integration_list_id: string;
};

export type GetAllGrantAccessResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[] | null;
};
// satu item
export const CreateCheckGiveAccessItemSchema = z.object({
  access_control_id: z.string(),
  action: z.number(),
  card_number: z.string(),
  trx_visitor_id: z.string(),
});

// request full payload
export const CreateCheckGiveAccessRequestSchema = z.object({
  data_access: z.array(CreateCheckGiveAccessItemSchema),
});

export type CreateCheckGiveAccessRequest = z.infer<typeof CreateCheckGiveAccessRequestSchema>;

export type CreateCheckGiveAccessResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: [] | null;
};
