import {z} from 'zod';


//TYPE
export type Item = {
    brand_id: string;
    brand_name: string;
    type: number;
    name: string;
    description: string;
    channel: string;
    door_id: string;
    raw: string;
    integration_id: string;
    integration_name: string;
    id: string;
};

export enum AccessControlType {
    Door = 0,
    Gate = 1,
}

//GET
export type GetAllAccessControlResponse = {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item[];
};

export type GetAccessControlPaginationResponse = {
    RecordsTotal: number;
    RecordsFiltered: number;
    Draw: number;
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item[];
};

//CREATE
export const CreateAccessControlRequestSchema = z.object({
    brand_id: z.string().default(''),
    type: z.number().default(0),
    name: z.string().default(''),
    description: z.string().default(''),
    channel: z.string().default(''),
    door_id: z.string().default(''),
    raw: z.string().default('{}'),
    integration_id: z.string().default(''),
});

export type CreateAccessControlRequest = z.infer<typeof CreateAccessControlRequestSchema>;

export interface CreateAccessControlResponse {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item | null;
}

//DELETE
export type DeleteAccessControlResponse<T = any> = {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: T | null;
};

//UPDATE
export interface UpdateAccessControlRequest {
    brand_id: string;
    type: number;
    name: string;
    description: string;
    channel: string;
    door_id: string;
    raw: string;
    integration_id: string;
};

export interface UpdateAccessControlResponse {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item | null;
};