import { z } from 'zod';

// export interface UpdateVisitorTypeRequest {
//   code: string;
//   name: string;
//   host: string;
// }

export type FormField = {
  short_name: string;
  long_display_text: string;
  field_type: number;
  is_primary: boolean;
  is_enable: boolean;
  mandatory: boolean;
  // custom_field_id: string;
};

export type SectionPageVisitorType = {
  sort: number;
  name: string;
  status: number;
  form_visitor: FormField[];
  pra_form_visitor: FormField[];
  signout_form_visitor: FormField[];
};

export type VisitorTypeDocument = {
  document_id?: string;
};

export type Item = {
  id: string;
  name: string;
  description: string;
  show_in_form: boolean;
  duration_visit: number;
  max_time_visit: number;
  can_parking: boolean;
  can_access: boolean;
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
  site_visitor_types?: string | null;
  visitor_type_documents: VisitorTypeDocument[];
  section_page_visitor_types: SectionPageVisitorType[];
};
export type GetAllVisitorTypePaginationResponse = {
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
  short_name: z.string().default(''),
  long_display_text: z.string().default(''),
  field_type: z.number().default(0),
  is_primary: z.boolean().default(false),
  is_enable: z.boolean().default(false),
  mandatory: z.boolean().default(false),
  // custom_field_id: z.string().uuid(),
});

export type FormVisitorTypes = z.infer<typeof formVisitorSchema>;

const sectionPageVisitorTypeSchema = z.object({
  sort: z.number().default(0),
  name: z.string().default(''),
  status: z.number().default(0),
  form_visitor: z.array(formVisitorSchema).default([]),
  pra_form_visitor: z.array(formVisitorSchema).default([]),
  signout_form_visitor: z.array(formVisitorSchema).default([]),
});

export const CreateVisitorTypeRequestSchema = z.object({
  name: z.string().default(''),
  description: z.string().default(''),
  show_in_form: z.boolean().default(false),
  duration_visit: z.number().default(0),
  max_time_visit: z.number().default(0),
  can_parking: z.boolean().default(false),
  can_access: z.boolean().default(false),
  add_to_menu: z.boolean().default(false),
  need_document: z.boolean().default(false),
  grace_time: z.number().default(0),
  direct_visit: z.boolean().default(false),
  period: z.number().default(0),
  can_notification_arrival: z.boolean().default(false),
  is_primary: z.boolean().default(false),
  is_enable: z.boolean().default(false),
  vip: z.boolean().default(false),
  simple_visitor: z.boolean().default(false),
  simple_period: z.boolean().default(false),

  // site_visitor_types: z.string().nullable().optional(),
  // Nullable fields from your JSON
  visitor_type_documents: z
    .array(z.object({ document_id: z.string() }))
    .nullable()
    .optional(),

  section_page_visitor_types: z.array(sectionPageVisitorTypeSchema).default([]),
});

export type CreateVisitorTypeRequest = z.infer<typeof CreateVisitorTypeRequestSchema>;

export interface CreateVisitorTypeResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}

// UPDATE
export const updateVisitorTypeSchmea = z.object({
  id: z.string(),
  name: z.string().default(''),
  description: z.string().default(''),
  show_in_form: z.boolean().default(false),
  duration_visit: z.number().default(0),
  max_time_visit: z.number().default(0),
  can_parking: z.boolean().default(false),
  can_access: z.boolean().default(false),
  add_to_menu: z.boolean().default(false),
  need_document: z.boolean().default(false),
  grace_time: z.number().default(0),
  direct_visit: z.boolean().optional(),
  period: z.number().default(0),
  can_notification_arrival: z.boolean().optional(),
  is_primary: z.boolean().optional(),
  is_enable: z.boolean().optional(),
  vip: z.boolean().optional(),
  simple_visitor: z.boolean().default(false),
  simple_period: z.boolean().default(false),

  // Nullable fields from your JSON
  site_visitor_types: z.string().nullable().optional(),
  // Nullable fields from your JSON
  visitor_type_documents: z
    .array(z.object({ document_id: z.string().optional() }))
    .nullable()
    .optional(),
  section_page_visitor_types: z.array(sectionPageVisitorTypeSchema).optional(),
});

export type UpdateVisitorTypeRequest = z.infer<typeof updateVisitorTypeSchmea>;

export interface UpdateVisitorTypeResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
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

// Delete
export type DeleteVisitorTypeResponse<T extends string = string> = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: T | null;
};
