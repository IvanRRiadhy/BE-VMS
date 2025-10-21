import { z } from 'zod';

//TYPE

export const DocumentItemSchema = z.object({
  name: z.string(),
  document_text: z.string(),
  document_type: z.number(),
  file: z.string().nullable().optional(),
  can_signed: z.boolean(),
  can_upload: z.boolean(),
  can_declined: z.boolean(),
  id: z.string(),
});
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
  document_type: z.number().default(-1),
  file: z.string().nullable().optional(),
  can_signed: z.boolean().optional(),
  can_upload: z.boolean().optional(),
  can_declined: z.boolean().optional(),
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

export const UpdateDocumentRequestSchema = z.object({
  name: z.string().default('').optional(),
  document_text: z.string().default('').optional(),
  document_type: z.number().default(-1),
  file: z.string().nullable().optional(),
  can_signed: z.boolean().optional(),
  can_upload: z.boolean().optional(),
  can_declined: z.boolean().optional(),
});

export type UpdateDocumentRequest = z.infer<typeof UpdateDocumentRequestSchema>;
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
