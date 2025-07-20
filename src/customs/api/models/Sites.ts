import { z } from 'zod';


//TYPE
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
  timezone: string;
  map_link: string;
  can_contactless_login: boolean;
  need_document: boolean;
}

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
});

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
});

export type UpdateSiteRequest = z.infer<typeof UpdateSiteRequestSchema>;

export interface UpdateSiteResponse {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item | null;
}


export type DeleteSiteResponse<T = any> = {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: T | null;
  };