import { z } from 'zod';

//TYPE
// export const BrandItemSchema = z.object({
//   name: z.string(),
//   type_brand: z.number(),
//   integration_list_id: z.string(),
//   id: z.string(),
// });

export type Item = {
  name: string;
  type_brand: number;
  integration_list_id: string;
  id: string;
}
//GET
export type GetAllBrandPaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};
export type GetAllBrandResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

//CREATE
export const CreateBrandRequestSchema = z.object({
  name: z.string().default(''),
  type_brand: z.number().default(0),
  integration_list_id: z.string().default(''),
});

export type CreateBrandRequest = z.infer<typeof CreateBrandRequestSchema>;

export interface CreateBrandResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
}

//UPDATE
export interface UpdateBrandRequest {
  name: string;
  type_brand: number;
  integration_list_id: string;
};

export interface UpdateBrandResponse {
      status: string;
      status_code: number;
      title: string;
      msg: string;
      collection: Item | null;
};