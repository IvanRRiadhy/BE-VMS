import { z } from 'zod';

export type Item = {
    name: string;
    document_text: string;
    document_type: number;
    file : string;
    can_signed: number;
    can_upload: number;
    can_declined: number;
    id: string;
}

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

export const CreateDocumentRequestSchema = z.object({
    name: z.string().default(''),
    document_text: z.string().default(''),
    document_type: z.number().default(0),
    file: z.string().default(''),
    can_signed: z.number().default(0),
    can_upload: z.number().default(0),
    can_declined: z.number().default(0),
});

export type CreateDocumentRequest = z.infer<typeof CreateDocumentRequestSchema>;

export interface CreateDocumentResponse {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item | null;
}
