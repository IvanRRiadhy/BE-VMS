import { z } from 'zod';

export type SchedulerVisitorType = {
  id: string;
  name: string;
  description: string | null;
  show_in_form: boolean;
  duration_visit: number;
  max_time_visit: number;
  can_parking: boolean;
  can_access: boolean;
  can_track_ble?: boolean;
  add_to_menu: boolean;
  need_document: boolean;
  grace_time: number;
  direct_visit: boolean;
  period: number;
  can_notification_arrival: boolean;
  is_primary: boolean;
  is_enable: boolean;
  vip: boolean;
  simple_visitor: boolean;
  simple_period: boolean;
  visitor_type_documents: any[];
  section_page_visitor_types: any[];
};

export type SchedulerSite = {
  id: string;
  type: number;
  name: string;
  description: string | null;
  image: string | null;
  can_visited: boolean;
  need_approval: boolean;
  type_approval: number;
  can_signout: boolean;
  auto_signout: boolean;
  signout_time: string | null;
  timezone: string | null;
  map_link: string | null;
  can_contactless_login: boolean;
  need_document: boolean;
  is_registered_point: boolean;
  access: any[];
};

export type SchedulerTimeAccess = {
  id: string;
  name: string;
  description: string | null;
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

export type SchedulerEmployee = {
  id: string;
  person_id?: string;
  identity_id?: string;
  card_number?: string;
  ble_card_number?: string;
  type: number;
  name: string;
  phone?: string;
  email?: string;
  gender?: string;
  address?: string;
  upload_fr?: number;
  qr_code?: string;
  faceimage?: string;
  access_area?: string;
  access_area_special?: string;
  birth_date?: string;
  join_date?: string;
  exit_date?: string;
  is_head?: boolean;
  head_employee_1?: string;
  head_employee_2?: string;
  organization_id?: string;
  department_id?: string;
  district_id?: string;
  is_email_verify?: boolean;
  status_employee?: string;
  vehicle_plate_number?: string;
  vehicle_type?: string;
};

export type Item = {
  id: string;
  name: string;
  time_access_id: string;
  time_access_name: string;
  visitor_type_id: string;
  visitor_type_name: string;
  site_id: string;
  site_name: string;
  host_id: string;
  host_name: string;
  host_organization_name: string;
  host_department_name: string;
  host_district_name: string;
  host_email: string;
  host_phone: string;
  user_id: string;

  visitorType?: SchedulerVisitorType;
  site?: SchedulerSite;
  timeAccess?: SchedulerTimeAccess;
  employee?: SchedulerEmployee;
};

export type GetAllSchedulerResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};
export type GetAllSchedulerPaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetAllSchdulerByIdResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

export const CreateSchedulerRequestSchmea = z.object({
  name: z.string().default(''),
  time_access_id: z.string().default(''),
  visitor_type_id: z.string().default(''),
  site_id: z.string().default(''),
  host_id: z.string().default(''),
});

export type CreateSchedulerRequest = z.infer<typeof CreateSchedulerRequestSchmea>;

export const UpdateSchdulerRequestSchema = z.object({
  name: z.string().optional(),
  time_access_id: z.string().optional(),
  visitor_type_id: z.string().optional(),
  site_id: z.string().optional(),
  host_id: z.string().optional(),
});

export type UpdateSchdulerRequest = z.infer<typeof UpdateSchdulerRequestSchema>;
