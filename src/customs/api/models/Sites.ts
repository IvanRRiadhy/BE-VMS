import { z } from 'zod';

//TYPE
export type Access = {
  site_id: string;
  sort: number;
  access_control_id: string;
  name: string;
  early_access: boolean;
};

export type Parking = {
  id: string;
  sort: number;
  site_id: string;
  name: string;
  early_access: boolean;
  prk_area_parking_id: string;
};

export type GetAllParkingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Parking[];
};

export type Tracking = {
  id: string;
  sort: number;
  site_id: string;
  name: string;
  early_access: boolean;
  trk_ble_floorplan_masked_area_id: string;
};

export type Item = {
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
  is_registered_point?: boolean;
  timezone: string;
  map_link: string;
  can_contactless_login: boolean;
  need_document: boolean;
  access: Access[];
  parking: Parking[];
  tracking: Tracking[];
};

export function generateKeyCode(): string {
  return crypto.randomUUID();
}

export enum SiteType {
  Site = 0,
  Building = 1,
  Floor = 2,
  Room = 3,
}

export enum TypeApproval {
  NoApproval = 0,
  VmsManager = 1,
  VmsManagerAndHost = 2,
  VmsManagerOrManager = 3,
}

//GET
export type GetAllSitesPaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetAllSitesResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetSiteByIdResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

//CREATE
export const CreateSiteRequestSchema = z.object({
  type: z.number().default(0),
  name: z.string().default(''),
  description: z.string().default(''),
  image: z.string().default(''),
  can_visited: z.boolean().default(false),
  need_approval: z.boolean().default(false),
  type_approval: z.number().default(0),
  can_signout: z.boolean().default(false),
  auto_signout: z.boolean().default(false),
  signout_time: z.string().default(''),
  timezone: z.string().default(''),
  map_link: z.string().default(''),
  can_contactless_login: z.boolean().default(false),
  need_document: z.boolean().default(false),
  is_registered_point: z.boolean().default(false).optional().nullable(),
  access: z
    .array(
      z.object({
        sort: z.number().optional().default(0),
        access_control_id: z.string().optional().default(''),
        name: z.string().optional().default(''),
        early_access: z.boolean().optional().default(false),
      }),
    )
    .nullable()
    .optional(),
});

// export const EditSiteRequestSchema = CreateSiteRequestSchema.extend({
//   id: z.string(),
// });

export const CreateSiteParkingSchema = z.object({
  sort: z.number().optional().default(0),
  site_id: z.string(),
  prk_area_parking_id: z.string(),
  early_access: z.boolean().optional().default(false),
});

export const CreateSiteTrackingSchema = z.object({
  sort: z.number().optional().default(0),
  site_id: z.string(),
  trk_ble_floorplan_masked_area_id: z.string(),
  early_access: z.boolean().optional().default(false),
});

export const UpdateSiteParkingSchema = z.object({
  id: z.string(),
  sort: z.number().optional().default(0),
  site_id: z.string(),
  prk_area_parking_id: z.string(),
  early_access: z.boolean().optional().default(false),
});

export const UpdateSiteTrackingSchema = z.object({
  id: z.string(),
  sort: z.number().optional().default(0),
  site_id: z.string(),
  trk_ble_floorplan_masked_area_id: z.string(),
  early_access: z.boolean().optional().default(false),
});

export interface UpdateSiteTrackingResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}

export interface UpdateSiteParkingResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}

export type UpdateSiteParkingRequest = z.infer<typeof UpdateSiteParkingSchema>;
export type UpdateSiteTrackingRequest = z.infer<typeof UpdateSiteTrackingSchema>;

export type CreateSiteParkingRequest = z.infer<typeof CreateSiteParkingSchema>;
export type CreateSiteTrackingRequest = z.infer<typeof CreateSiteTrackingSchema>;

export type CreateSiteRequest = z.infer<typeof CreateSiteRequestSchema>;

export interface CreateSiteResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}

//UPLOAD

export interface UploadImageSiteResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}

//UPDATE
export const UpdateSiteRequestSchema = z.object({
  type: z.number().default(0),
  name: z.string().default(''),
  description: z.string().default(''),
  image: z.string().default(''),
  can_visited: z.boolean().default(false),
  need_approval: z.boolean().default(false),
  type_approval: z.number().default(0),
  can_signout: z.boolean().default(false),
  auto_signout: z.boolean().default(false),
  signout_time: z.string().default(''),
  timezone: z.string().default(''),
  map_link: z.string().default(''),
  can_contactless_login: z.boolean().default(false),
  need_document: z.boolean().default(false),
  is_registered_point: z.boolean().default(false).optional().nullable(),
  access: z
    .array(
      z.object({
        sort: z.number().optional().default(0),
        access_control_id: z.string().optional().default(''),
        name: z.string().optional().default(''),
        early_access: z.boolean().optional().default(false),
      }),
    )
    .nullable()
    .optional(),
});

export type UpdateSiteRequest = z.infer<typeof UpdateSiteRequestSchema>;

export interface UpdateSiteResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}

export interface UpdateSitestRequest {
  id?: string;
  type?: number;
  name?: string;
  description?: string;
  image?: string;
  can_visited?: boolean;
  need_approval?: boolean;
  type_approval?: number;
  can_signout?: boolean;
  auto_signout?: boolean;
  signout_time?: string;
  timezone?: string;
  map_link?: string;
  can_contactless_login?: boolean;
  need_document?: boolean;
  is_registered_point?: boolean;
}

export type DeleteSiteResponse<T = any> = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: T | null;
};
