import { z } from 'zod';
export type VisitorTypeParking = {
  id: string;
  uid: string;
  name: string;
  group_type: string;
  active: boolean;
  integration_id: string;
  visitor_type_id: string;
};

export type GetVisitorTypeParkingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: VisitorTypeParking[] | null;
};

export type GetVisitorTypeParkingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: VisitorTypeParking | null;
};

export const UpdateVisitorTypeParkingRequestSchema = z.object({
  name: z.string().default('').optional(),
  group_type: z.string().default('').optional(),
  active: z.boolean().default(false).optional(),
  visitor_type_id: z.string().default('').optional(),
  integration_id: z.string().default('').optional(),
  id: z.string().default('').optional(),
  uid: z.string().default('').optional(),
});

export type UpdateVisitorTypeParkingRequest = z.infer<typeof UpdateVisitorTypeParkingRequestSchema>;

export interface UpdateVisitorTypeParkingResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: VisitorTypeParking | null;
}

export type BlockParking = {
  id: string;
  uid: string;
  name: string;
  block_code: string;
  serial: string;
  integration_id: string;
  area_id: string;
  active: boolean;
};

export type GetBlockParkingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BlockParking[] | null;
};

export type GetBlockParkingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BlockParking | null;
};

export const UpdateBlockParkingRequestSchema = z.object({
  name: z.string().default('').optional(),
  block_code: z.string().default('').optional(),
  serial: z.string().default('').optional(),
  active: z.boolean().default(false).optional(),
  area_id: z.string().default('').optional(),
  integration_id: z.string().default('').optional(),
  id: z.string().default('').optional(),
  uid: z.string().default('').optional(),
});

export type UpdateBlockParkingRequest = z.infer<typeof UpdateBlockParkingRequestSchema>;

export interface UpdateBlockParkingResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BlockParking | null;
}

export type AreaParking = {
  id: string;
  uid: string;
  name: string;
  type: string;
  code: string;
  location: string;
  need_barier: boolean;
  need_block: boolean;
  integration_id: string;
  active: boolean;
};

export type GetAreaParkingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AreaParking[] | null;
};

export type GetAreaParkingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AreaParking | null;
};

export const UpdateAreaParkingRequestSchema = z.object({
  name: z.string().default('').optional(),
  type: z.string().default('').optional(),
  code: z.string().default('').optional(),
  location: z.string().default('').optional(),
  need_barier: z.boolean().default(false).optional(),
  need_block: z.boolean().default(false).optional(),
  active: z.boolean().default(false).optional(),
  integration_id: z.string().default('').optional(),
  id: z.string().default('').optional(),
  uid: z.string().default('').optional(),
});

export type UpdateAreaParkingRequest = z.infer<typeof UpdateAreaParkingRequestSchema>;

export interface UpdateAreaParkingResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AreaParking | null;
}

export type SlotParking = {
  id: string;
  uid: string;
  name: string;
  number: number;
  integration_id: string;
  host_id: string;
  active: boolean;
};

export type GetSlotParkingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: SlotParking[] | null;
};

export type GetSlotParkingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: SlotParking | null;
};

export const UpdateSlotParkingRequestSchema = z.object({
  name: z.string().default('').optional(),
  number: z.number().default(0).optional(),
  active: z.boolean().default(false).optional(),
  host_id: z.string().default('').optional(),
  integration_id: z.string().default('').optional(),
  id: z.string().default('').optional(),
  uid: z.string().default('').optional(),
});

export type UpdateSlotParkingRequest = z.infer<typeof UpdateSlotParkingRequestSchema>;

export interface UpdateSlotParkingResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: SlotParking | null;
}

export type VehicleParking = {
  id: string;
  uid: string;
  name: string;
  type: string;
  vehicle_type: string;
  slug: string;
  integration_id: string;
  active: boolean;
};

export type GetVehicleParkingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: VehicleParking[] | null;
};

export type GetVehicleParkingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: VehicleParking | null;
};

export const UpdateVehicleParkingRequestSchema = z.object({
  name: z.string().default('').optional(),
  type: z.string().default('').optional(),
  vehicle_type: z.string().default('').optional(),
  slug: z.string().default('').optional(),
  active: z.boolean().default(false).optional(),
  integration_id: z.string().default('').optional(),
  id: z.string().default('').optional(),
  uid: z.string().default('').optional(),
});

export type UpdateVehicleParkingRequest = z.infer<typeof UpdateVehicleParkingRequestSchema>;

export interface UpdateVehicleParkingResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: VehicleParking | null;
}
