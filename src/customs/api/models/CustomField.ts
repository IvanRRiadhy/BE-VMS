import { z } from 'zod';

//TYPE
export type multiOptField = {
    value: string;
    name: string;
    id: string;
};
export type Item = {
    short_name: string;
    long_display_text: string;
    field_type: number;
    multiple_option_fields: multiOptField[];
    id: string;
};

export enum FieldType {
    Text = 0,
    Number = 1,
    Email = 2,
    Dropdown = 3,
    Datepicker = 4,
    Radio = 5,
    Checkbox = 6,
};

//GET
export type GetAllCustomFieldResponse = {
    status : string;
    status_code : number;
    title : string;
    msg : string;
    collection : Item[];
};

export type GetAllCustomFieldPaginationResponse = {
    RecordsTotal : number;
    RecordsFiltered : number;
    Draw : number;
    status : string;
    status_code : number;
    title : string;
    msg : string;
    collection : Item[];
};

//CREATE

export const MultiOptFieldSchema = z.object({
  value: z.string().default(''),
  name: z.string().default(''),
  id: z.string().default(''),
});
export const CreateCustomFieldRequestSchema = z.object({
    short_name: z.string().default(''),
    long_display_text: z.string().default(''),
    field_type: z.number().default(0),
    multiple_option_fields: z.array(MultiOptFieldSchema).default([]),
});

export type CreateCustomFieldRequest = z.infer<typeof CreateCustomFieldRequestSchema>;

export interface CreateCustomFieldResponse {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item | null;
};

//UPDATE
export interface UpdateCustomFieldRequest {
    short_name: string;
    long_display_text: string;
    field_type: number;
    multiple_option_fields: multiOptField[];
};

export interface UpdateCustomFieldResponse {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item | null;
};