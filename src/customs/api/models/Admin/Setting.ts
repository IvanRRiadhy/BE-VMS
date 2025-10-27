import { z } from 'zod';

export type Item = {
  id: string;
  organization_id: string;
};

export const CreateSettingSchema = z.object({
  id: z.string(),
  organization_id: z.string(),
});

export type CreateSettingRequest = z.infer<typeof CreateSettingSchema>;

export type GetAllSettingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: {};
};
