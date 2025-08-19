import { z } from 'zod';

//TYPE

export const DocumentItemSchema = z.object({
      name: z.string(),
  document_text: z.string(),
  document_type: z.number(),
  file: z.string(),
  can_signed: z.boolean(),
  can_upload: z.boolean(),
  can_declined: z.boolean(),
  id: z.string(),
})
export type Item = z.infer<typeof DocumentItemSchema>;

export type GetAllDocumentResponse = {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item[];
};

//GET
export type GetAllDocumentPaginationResponse = {
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
export const CreateDocumentRequestSchema = z.object({
    name: z.string().default(''),
    document_text: z.string().default(''),
    document_type: z.number().default(0),
    file: z.string().default(''),
    can_signed: z.boolean().default(false),
    can_upload: z.boolean().default(false),
    can_declined: z.boolean().default(false),
});

export type CreateDocumentRequest = z.infer<typeof CreateDocumentRequestSchema>;

export interface CreateDocumentResponse {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item | null;
}

//UPDATE
export interface UpdateDocumentRequest {
    name: string;
    document_text: string;
    document_type: number;
    file: string;
    can_signed: boolean;
    can_upload: boolean;
    can_declined: boolean;
}

export interface UpdateDocumentResponse {
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

//DELETE
export type DeleteDocumentResponse<T = any> = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: T | null;
};
