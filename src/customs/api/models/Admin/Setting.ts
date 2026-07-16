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



export const UpdateSettingVmsSchema = z.object({
  default_site_id: z.string(),
  employee_access_mode: z.enum([
    'DirectAccess',
    'NeedCheckIn',
    'NeedVisitorCard',
  ]),
  visitor_access_mode: z.enum([
    'QRCode',
    'TemporaryCard',
    'FaceRecognition',
    'ManualRegistration',
  ]),
  grant_access_mode: z.number(),
  grant_access_when: z.number(),
  initial_grant_access: z.number(),
  temporary_access_before_minutes: z.number(),
  temporary_access_after_minutes: z.number(),
  need_host_approval: z.boolean(),
  approval_workflow_id: z.string(),
  auto_signout: z.boolean(),
  auto_signout_after_minutes: z.number(),
});

export type UpdateSettingVmsRequest = z.infer<
  typeof UpdateSettingVmsSchema
>;