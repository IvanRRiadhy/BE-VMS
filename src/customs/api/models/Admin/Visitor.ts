import { z } from 'zod';

export type Item = {
  id: string;
  trx_visitor_id: string;
  visitor_type: string;
  is_group: boolean;
  identity_id: string;
  name: string;
  email: string;
  gender: number;
  host: string | null;
  address: string;
  phone: string;
  is_vip: boolean;
  is_email_verified: boolean;
  email_verification_send_at: string;
  email_verification_token: string;
  visitor_period_start: string;
  visitor_period_end: string;
  is_employee: boolean;
  employee_id: string;
  question_page: SectionPageVisitor[];
};

export type DataVisitor = {
  id?: string; // ← pastikan tiap visitor ada ID unik
  // group_id?: string;
  question_page: SectionPageVisitor[];
};

export type FormField = {
  id?: string;
  remarks?: string;
  sort?: number;
  short_name?: string;
  long_display_text?: string;
  field_type?: number;
  is_primary?: boolean;
  is_enable?: boolean;
  mandatory?: boolean;
  custom_field_id?: string | null;
  multiple_option_fields?: any[]; // Atau define type lebih spesifik kalau ada\
  visitor_form_type?: number;
  document_id?: string;
  answer_text?: string;
  answer_datetime?: string;
  answer_file?: string;
};

export type GetAllVisitorPaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

const formVisitorSchema = z.object({
  sort: z.number().optional().default(0),
  short_name: z.string().optional().default(''),
  long_display_text: z.string().optional().default(''),
  field_type: z.number().optional().default(0),
  is_primary: z.boolean().optional().default(false),
  is_enable: z.boolean().optional().default(false),
  mandatory: z.boolean().optional().default(false),
  remarks: z.string().optional().default(''),
  custom_field_id: z.string().optional().default(''),
  multiple_option_fields: z.array(z.any()).optional().default([]),
  visitor_form_type: z.number().optional(),
  answer_text: z.string().optional(),
  answer_datetime: z.string().datetime().optional(), // atau nullable().optional() jika butuh null
  answer_file: z.string().optional(),
});

export type FormVisitor = z.infer<typeof formVisitorSchema>;

const sectionPageVisitorSchema = z.object({
  id: z.string().default('').optional(),
  sort: z.number().default(0),
  name: z.string().default(''),
  status: z.number().default(0).optional(),
  is_document: z.boolean().default(false).optional(),
  can_multiple_used: z.boolean().default(false).optional(),
  self_only: z.boolean().default(false).optional(),
  foreign_id: z.string().default('').optional(),
  form: z.array(formVisitorSchema).default([]),
  // visit_form: z.array(formVisitorSchema).default([]),
  // pra_form: z.array(formVisitorSchema).nullable(),
  // checkout_form: z.array(formVisitorSchema).nullable(),
});

export const visitorItemSchema = z.object({
  question_page: z.array(sectionPageVisitorSchema).default([]),
});

export const ListGroupItemSchema = z.object({
  visitor_type: z.string().default(''),
  type_registered: z.number().default(0).optional(),
  is_group: z.boolean().default(false).optional(),
  tz: z.string().default('').optional(),
  registered_site: z.string().default('').optional(),
  group_code: z.string().default('').optional(),
  group_name: z.string().default('').optional(),
  data_visitor: z.array(visitorItemSchema).default([]),
});



// export const CreateGroupVisitorRequestSchema = z.object({
//   list_group: z.array(ListGroupItemSchema),
// });
// export type CreateGroupVisitorRequest = z.infer<typeof CreateGroupVisitorRequestSchema>;

export type SectionPageVisitor = {
  id?: string;
  sort: number;
  name: string;
  is_document?: boolean;
  can_multiple_used?: boolean;
  self_only?: boolean;
  foreign_id?: string;
  form?: FormField[];
};

export const CreateSingleVisitorRequestSchema = z.object({
  visitor_type: z.string(),
  type_registered: z.number().default(0),
  is_group: z.boolean().default(false),
  tz: z.string(),
  registered_site: z.string().optional(),
  data_visitor: z.array(visitorItemSchema),
});
export type CreateSingleVisitorRequest = z.infer<typeof CreateSingleVisitorRequestSchema>;

// Item visitor (tetap sama)
// export const visitorItemSchema = z.object({
//   question_page: z.array(sectionPageVisitorSchema).default([]),
// });

// ---- SINGLE VISITOR ----
export const CreateVisitorRequestSchema = z.object({
  visitor_type: z.string().optional(),
  type_registered: z.number().optional().default(0),
  is_group: z.boolean().default(false).optional(),
  tz: z.string().optional(),
  registered_site: z.string().optional(),
  data_visitor: z.array(visitorItemSchema).optional(),
});

// ---- GROUP VISITOR ----
export const CreateGroupVisitorRequestSchema = z.object({
  list_group: z.array(
    z.object({
      visitor_type: z.string().optional(),
      is_group: z.boolean().optional().default(false),
      type_registered: z.number().optional().default(0),
      tz: z.string().optional(),
      registered_site: z.string().optional(),
      group_code: z.string().optional(),
      group_name: z.string().optional(),
      data_visitor: z.array(visitorItemSchema),
    })
  ),
});

export type CreateVisitorRequest = z.infer<typeof CreateVisitorRequestSchema>;
export type CreateGroupVisitorRequest = z.infer<typeof CreateGroupVisitorRequestSchema>;

// export const CreateVisitorRequestSchema = z.union([
//   CreateSingleVisitorRequestSchema,
//   CreateGroupVisitorRequestSchema,
// ]);
// export type CreateVisitorRequest = z.infer<typeof CreateVisitorRequestSchema>;

export interface CreateVisitorResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: CreateVisitorCollection | null;
}

export interface ValidationErrorResponse {
  type: string;
  title: string;
  status: number;
  errors: {
    [field: string]: string[];
  };
  traceId?: string;
}

export type DeleteVisitorResponse<T extends string = string> = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: T | null;
};

export interface VisitorTrx {
  id: string; // trx_visitor_id
  visitor_id: string | null; // id master visitor
  agenda: string | null;
  host: string | null;
  group_code: string | null;
  group_name: string | null;
  visitor_period_start: string | null;
  visitor_period_end: string | null;
  meeting_code: string | null;
  self_only: boolean;
  checkin_at: string | null;
  checkout_at: string | null;
  deny_at: string | null;
  block_at: string | null;
  unblock_at: string | null;
  checkin_by: string | null;
  checkout_by: string | null;
  deny_by: string | null;
  deny_reason: string | null;
  block_by: string | null;
  block_reason: string | null;
  visitor_status: string; // ← ubah ke string ("PraCheckin", "Checkin", dst.)
  invitation_created_at: string;
  visitor_number: string;
  visitor_code: string;
  vehicle_plate: string | null; // dari "vehicle_plate_number"
  vehicle_type: string | null;
  remarks: string | null;
  site_place: string | null;
  parking_id: string | null;
  identity_image: string | null;
  selfie_image: string | null;
  nda: string | null;
  can_track_ble: boolean | null;
  can_track_cctv: boolean | null;
  can_parking: boolean | null;
  can_access: boolean | null;
  can_meeting: boolean | null;
  tz: string | null;
  is_group: boolean;

  visitor: {
    visitor_type: string;
    identity_id: string;
    name: string;
    email: string;
    organization: string | null;
    gender: string | null;
    address: string | null;
    phone: string | null;
    is_vip: boolean | null;
    is_email_verified: boolean;
    email_verification_send_at: string | null;
    email_verification_token: string;
    visitor_period_start: string | null;
    visitor_period_end: string | null;
    is_employee: boolean;
    employee_id: string | null;
    employee: any | null;
    id: string;
  };
}

export interface CreateVisitorCollection {
  available_cards: any[];
  registered_site: any;
  visitors: VisitorTrx[];
  site_lists: any[];
  site_place_data: SitePlaceData;
  host_data: HostData;
  visitor_type_data: VisitorTypeData;
  total_card_needs: number;
  initial_trx_code: string;
}

export interface SitePlaceData {
  id: string;
  type: number;
  name: string;
  description: string;
  image: string;
  can_visited: boolean;
  need_approval: boolean;
  type_approval: number;
  can_signout: boolean;
  auto_signout: boolean;
  signout_time: string;
  timezone: string;
  map_link: string;
  can_contactless_login: boolean;
  need_document: boolean;
  is_registered_point: boolean;
  access: any[];
}

export interface HostData {
  id: string;
  person_id: string;
  identity_id: string;
  card_number: string;
  ble_card_number: string;
  type: number;
  name: string;
  phone: string;
  email: string;
  gender: string;
  address: string;
  upload_fr: number;
  qr_code: string;
  faceimage: string;
  access_area: string;
  access_area_special: string;
  birth_date: string;
  join_date: string;
  exit_date: string;
  is_head: boolean;
  head_employee_1: string;
  head_employee_2: string;
  organization_id: string;
  department_id: string;
  district_id: string;
  is_email_verify: boolean;
  status_employee: string;
  organization: any;
  department: any;
  district: any;
}

export interface VisitorTypeData {
  id: string;
  name: string;
  description: string;
  show_in_form: boolean;
  duration_visit: number;
  max_time_visit: number;
  can_parking: boolean;
  can_access: boolean;
  can_track_ble: boolean | null;
  can_track_cctv: boolean | null;
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
  prefix: string | null;
  site_visitor_types: any;
  visitor_type_documents: VisitorTypeDocument[];
  section_page_visitor_types: SectionPageVisitor[];
}

export interface VisitorTypeDocument {
  id: string;
  document_id: string;
  document_name: string;
  can_signed: boolean;
  can_upload: boolean;
  can_declined: boolean;
  is_primary: boolean;
  remarks: string | null;
}

export interface CreateVisitorResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collections: CreateVisitorCollection | null;
}
