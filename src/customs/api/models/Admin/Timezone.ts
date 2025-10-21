import { z } from 'zod';
export type Item = {
  id: string;
  name: string;
  description: string;
  sunday: string;
  sunday_end: string;
  monday: string;
  monday_end: string;
  tuesday: string;
  tuesday_end: string;
  wednesday: string;
  wednesday_end: string;
  thursday: string;
  thursday_end: string;
  friday: string;
  friday_end: string;
  saturday: string;
  saturday_end: string;
};

export const CreateTimezoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  sunday: z.string().optional(),
  sunday_end: z.string().optional(),
  monday: z.string().optional(),
  monday_end: z.string().optional(),
  tuesday: z.string().optional(),
  tuesday_end: z.string().optional(),
  wednesday: z.string().optional(),
  wednesday_end: z.string().optional(),
  thursday: z.string().optional(),
  thursday_end: z.string().optional(),
  friday: z.string().optional(),
  friday_end: z.string().optional(),
  saturday: z.string().optional(),
  saturday_end: z.string().optional(),
});

export type CreateTimezoneRequest = z.infer<typeof CreateTimezoneSchema>;

export const UpdateTimezoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  sunday: z.string().optional(),
  sunday_end: z.string().optional(),
  monday: z.string().optional(),
  monday_end: z.string().optional(),
  tuesday: z.string().optional(),
  tuesday_end: z.string().optional(),
  wednesday: z.string().optional(),
  wednesday_end: z.string().optional(),
  thursday: z.string().optional(),
  thursday_end: z.string().optional(),
  friday: z.string().optional(),
  friday_end: z.string().optional(),
  saturday: z.string().optional(),
  saturday_end: z.string().optional(),
});

export type UpdateTimezoneRequest = z.infer<typeof UpdateTimezoneSchema>;

export type GetAllTimezoneResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetTimezoneByIdResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

export type CreateTimezoneResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

export type UpdateTimezoneResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

export type GetAllTimezonePaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type DeleteTimezoneResponse<T = any> = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: T | null;
};
