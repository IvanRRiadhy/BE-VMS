import {z} from 'zod';
import {DocumentItemSchema, Item as DocumentItem} from './Document'

//TYPE
export type Item = {
    site_name: string;
    site_id: string;
    documents: DocumentItem;
    retentionTime: number;
    id: string;
}

//GET
export type GetAllSiteDocumentResponse = {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item[];
}

//CREATE
export const CreateSiteDocumentRequestSchema = z.object({
    site_id: z.string().default(''),
    documents: z.string().default(''),
    retentionTime: z.number().default(0),
})

export type CreateSiteDocumentRequest = z.infer<typeof CreateSiteDocumentRequestSchema>

export interface CreateSiteDocumentResponse {
        status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item | null;
}

//UPDATE
export interface UpdateSiteDocumentRequest {
    site_id: string;
    documents: DocumentItem;
    retentionTime: number;
}