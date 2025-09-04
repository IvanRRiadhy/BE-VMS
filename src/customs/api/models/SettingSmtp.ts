import { z } from 'zod';

export type Item = {
  selected_email: boolean;
  name: string;
  title_email: string;
  host: string;
  user: string;
  password: string;
  port: string;
  secure: boolean;
  // testing: string;
  // testing_msg: string;
  from_address: string;
  id: string;
};

export const CreateSettingSmtpSchema = z.object({
  id: z.string().default(''),
  selected_email: z.boolean().default(false),
  name: z.string().default(''),
  title_email: z.string().default(''),
  host: z.string().default(''),
  user: z.string().default(''),
  password: z.string().default(''),
  port: z.string().default(''),
  secure: z.boolean().default(false),
  // testing: z.string().default(''),
  // testing_msg: z.string().default(''),
  from_address: z.string().default(''),
});

export type CreateSettingSmtpRequest = z.infer<typeof CreateSettingSmtpSchema>;

export const UpdateSettingSmtpSchema = z.object({
  selected_email: z.boolean().default(false),
  name: z.string().default(''),
  title_email: z.string().default(''),
  host: z.string().default(''),
  user: z.string().default(''),
  password: z.string().default(''),
  port: z.string().default(''),
  secure: z.boolean().default(false),
  // testing: z.string().default(''),
  // testing_msg: z.string().default(''),
  from_address: z.string().default(''),
});

export type UpdateSettingSmtpRequest = z.infer<typeof UpdateSettingSmtpSchema>;

export type GetAllSettingSmtpPaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetAllSettingSmtpResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type UpdateSettingSmtpResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

export type CreateSettingSmtpResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

export type ItemEmail = {
  id: string;
  is_html: boolean;
  email_sender: string;
  setting_smtp_id: string;
};

export type GetAllSettingSmtpEmailResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: ItemEmail[];
};

export type CreateEmailResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: ItemEmail | null;
};

export const CreateEmailSchema = z.object({
  is_html: z.boolean().default(false),
  email_sender: z.string().default(''),
  setting_smtp_id: z.string().default(''),
});

export type CreateEmailRequest = z.infer<typeof CreateEmailSchema>;