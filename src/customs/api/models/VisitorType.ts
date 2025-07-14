import {z} from 'zod';

export type Item = {
    id: string;
    is_Active: boolean;
    visitor_Type: string;
    document: string;
    need_Photo: boolean;
    print_Badge: boolean;
    wifiCred: boolean;
    captureVisitorId: boolean;
    show_Ipad: boolean;
    videoURL: string;
    welcomeMessage: string;
    watchlistMessage: string;
    customBadge: string;
    signinDetails: {
        fullName: {
            display: string;
            status: boolean;
            mandatory: boolean;
        };
        email: {
            display: string;
            status: boolean;
            mandatory: boolean;
        };
        host: {
            display: string;
            status: boolean;
            mandatory: boolean;
        };
        company: {
            display: string;
            status: boolean;
            mandatory: boolean;
        };
        phoneNumber: {
            display: string;
            status: boolean;
            mandatory: boolean;
        };
    };
    signOutDetails: {
        fullName?: {
            display: string;
            status: boolean;
            mandatory: boolean;
        };
        email?: {
            display: string;
            status: boolean;
            mandatory: boolean;
        };
    };
    adminFields: {
        fullName?: {
            display: string;
            status: boolean;
            mandatory: boolean;
        };
        email?: {
            display: string;
            status: boolean;
            mandatory: boolean;
        };
    }
};

export type GetAllVisitorTypePaginationResponse = {
    RecordsTotal: number;
    RecordsFiltered: number;
    Draw: number;
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item[];
};

const detailFieldSchema = z.object({
  display: z.string().default(''),
  status: z.boolean().default(true),
  mandatory: z.boolean().default(true),
});

export const CreateVisitorTypeRequestSchema = z.object({
  is_Active: z.boolean().default(true),
  visitor_Type: z.string().default(''),
  document: z.string().default(''),
  need_Photo: z.boolean().default(false),
  print_Badge: z.boolean().default(false),
  wifiCred: z.boolean().default(false),
  captureVisitorId: z.boolean().default(false),
  show_Ipad: z.boolean().default(false),
  videoURL: z.string().default(''),
  welcomeMessage: z.string().default(''),
  watchlistMessage: z.string().default(''),
  customBadge: z.string().default(''),
  signinDetails: z.object({
    fullName: detailFieldSchema,
    email: detailFieldSchema,
    host: detailFieldSchema,
    company: detailFieldSchema,
    phoneNumber: detailFieldSchema,
  }).default({
    fullName: {},
    email: {},
    host: {},
    company: {},
    phoneNumber: {},
  }),
  signOutDetails: z.object({
    fullName: detailFieldSchema.optional(),
    email: detailFieldSchema.optional(),
  }).default({}),
  adminFields: z.object({
    fullName: detailFieldSchema.optional(),
    email: detailFieldSchema.optional(),
  }).default({}),
});

export type CreateVisitorTypeRequest = z.infer<typeof CreateVisitorTypeRequestSchema>;

export interface CreateVisitorTypeResponse {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item | null;
}
