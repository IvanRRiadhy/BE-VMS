import { z } from 'zod';

export type Item = {
    id: string;
    siteName: string;
    address: string;
    city: string;
    province: string;
    zipCode: string;
    timeZone: string;
    code: string;
    policyConfig: {
        consentType: string;
        document: string;
        period: number;
    };
    settings: {
        facialRecog: boolean;
        signOutEnable: boolean;
        autoSignOutVisitor: boolean;
        autoSignOutEmployee: boolean;
        watchlistCheck: boolean;
        contactlessSignin: boolean;
        employeeSignEnable: boolean;
        status: boolean;
        reviewUnregistered: boolean;
        restrictHost: boolean;
        deliveryDropOff: boolean;
    };
}

export function generateKeyCode(): string {
    return crypto.randomUUID();
}

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

export const CreateSiteRequestSchema = z.object({
    siteName: z.string().default(''),
    address: z.string().default(''),
    city: z.string().default(''),
    province: z.string().default(''),
    zipCode: z.string().default(''),
    timeZone: z.string().default(''),
    code: z.string().default(generateKeyCode()),
    policyConfig: z.object({
        consentType: z.string().default(''),
        document: z.string().default(''),
        period: z.number().default(0),
    }).default({
        consentType: '',
        document: '',
        period: 0
    }),
    settings: z.object({
        facialRecog: z.boolean().default(false),
        signOutEnable: z.boolean().default(false),
        autoSignOutVisitor: z.boolean().default(false),
        autoSignOutEmployee: z.boolean().default(false),
        watchlistCheck: z.boolean().default(false),
        contactlessSignin: z.boolean().default(false),
        employeeSignEnable: z.boolean().default(false),
        status: z.boolean().default(true),
        reviewUnregistered: z.boolean().default(false),
        restrictHost: z.boolean().default(false),
        deliveryDropOff: z.boolean().default(false),
    }).default({
        facialRecog: false,
        signOutEnable: false,
        autoSignOutVisitor: false,
        autoSignOutEmployee: false,
        watchlistCheck: false,
        contactlessSignin: false,
        employeeSignEnable: false,
        status: true,
        reviewUnregistered: false,
        restrictHost: false,
        deliveryDropOff: false
    }),
});

export type CreateSiteRequest = z.infer<typeof CreateSiteRequestSchema>;

export interface CreateSiteResponse {
    status: string;
    status_code: number;
    title: string;
    msg: string;
    collection: Item | null;
}