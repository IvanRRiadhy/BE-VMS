import _ from 'lodash';
import { z } from 'zod';

// TYPE
export const AvailableIntegrationItemSchema = z.object({
    name: z.string(),
    thumbnail: z.string(),
    brand_name: z.string(),
    brand_type: z.number(),
    integration_type: z.number(),
    api_type_auth: z.number(),
    id: z.string(),
});
export const IntegrationItemScheme = z.object({
    name: z.string(),
    brand_name: z.string(),
    brand_type: z.number(),
    integration_type: z.number(),
    api_type_auth: z.number(),
    api_url: z.string(),
    api_auth_username: z.string(),
    api_auth_passwd: z.string(),
    api_key_field: z.string(),
    api_key_value: z.string(),
    id: z.string(),

});

export type AvailableItem = z.infer<typeof AvailableIntegrationItemSchema>;
export type Item = z.infer<typeof IntegrationItemScheme>;

export enum BrandType {
  AccessControl = 0,
  Camera = 1,
  CameraAnalytics = 2,
  FaceReader = 3,
  Software = 4,
  BuildingManagement = 5,
}

export enum IntegrationType {
  SDK = 0,
  API = 1,
  InternalModule = 2,
}

export enum ApiTypeAuth {
  Basic = 0,
  Bearer = 1,
  ApiKey = 2,
  Bacnet = 4,
}
export const apiKeyFieldMap: Record<string, string> = {
  'Bio People Tracking System': 'X-PEOPLETRACKING-API-KEY',
  'Bio Parking System': 'X-PARKING-API-KEY',
  'Bio Meeting Room System': 'X-BIO-SMR-KEY',
  // Add more mappings as needed
};
//GET
export type GetAllIntegrationResponse = {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item[];
}

export type GetAvailableIntegrationResponse = {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: AvailableItem[];
};

//CREATE
export const CreateIntegrationRequestSchema = z.object({
    name: z.string().default(''),
    brand_name: z.string().default(''),
    brand_type: z.number().default(0),
    integration_type: z.number().default(0),
    api_type_auth: z.number().default(0),
    api_url: z.string().default(''),
    api_auth_username: z.string().default(''),
    api_auth_passwd: z.string().default(''),
    api_key_field: z.string().default(''),
    api_key_value: z.string().default(''),
    integration_list_id: z.string().default(''),
});

export type CreateIntegrationRequest = z.infer<typeof CreateIntegrationRequestSchema>;

export interface CreateIntegrationResponse {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item | null;
}

//DELETE
export type DeleteIntegrationResponse<T = any> = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: T | null;
};

//UPDATE
export const UpdateIntegrationRequestSchema = z.object({
    name: z.string().default(''),
    brand_name: z.string().default(''),
    brand_type: z.number().default(0),
    integration_type: z.number().default(0),
    api_type_auth: z.number().default(0),
    api_url: z.string().default(''),
    api_auth_username: z.string().default(''),
    api_auth_passwd: z.string().default(''),
    api_key_field: z.string().default(''),
    api_key_value: z.string().default(''),
    integration_list_id: z.string().default(''),
});

export type UpdateIntegrationRequest = z.infer<typeof UpdateIntegrationRequestSchema>;

export interface UpdateIntegrationResponse {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item | null;
}