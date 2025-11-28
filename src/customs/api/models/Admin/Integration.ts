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
  id: z.string(),
  name: z.string(),
  thumbnail: z.string(),
  brand_name: z.string(),
  brand_type: z.number(),
  integration_type: z.number(),
  api_type_auth: z.number(),
  api_url: z.string(),
  api_auth_username: z.string(),
  api_auth_passwd: z.string(),
  api_key_field: z.string(),
  api_key_value: z.string(),
  integration_list_id: z.string(),
});

// export type Item = z.infer<typeof IntegrationItemScheme>;
export type Item = {
  id: string;
  name: string;
  thumbnail: string;
  brand_name: string;
  brand_type: number;
  integration_type: number;
  api_type_auth: number;
  api_url: string;
  api_auth_username: string;
  api_auth_passwd: string;
  api_key_field: string;
  api_key_value: string;
  integration_list_id: string;
};

export type AvailableItem = z.infer<typeof AvailableIntegrationItemSchema>;

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
  'Bio People Tracking System': 'X-BIOPEOPLETRACKING-API-KEY',
  'Bio Parking System': 'X-BIOPARKING-API-KEY',
  'Bio Meeting Room System': 'X-BIOSMR-API-KEY',

  // Add more mappings as needed
};
//GET
export type GetAllIntegrationResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetAvailableIntegrationResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AvailableItem[];
};

export type GetIntegrationByIdResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
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

// ================== Additional Types for Integration with Honeywell ================== //
export type Companies = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  company_id: string;
  description: string;
  organization_id: string;
  honeywell_id: string;
};

export type GetCompaniesResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Companies[] | null;
};

export type GetCompaniesResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Companies | null;
};

export const UpdateCompaniesRequestSchema = z.object({
  name: z.string().default('').optional(),
  address: z.string().default('').optional(),
  city: z.string().default('').optional(),
  state: z.string().default('').optional(),
  zip: z.string().default('').optional(),
  company_id: z.string().default('').optional(),
  description: z.string().default('').optional(),
  organization_id: z.string().default('').optional(),
  honeywell_id: z.string().default('').optional(),
  organization: z.string().default('').optional(),
  active: z.boolean().default(false).optional(),
});

export type UpdateCompaniesRequest = z.infer<typeof UpdateCompaniesRequestSchema>;

export interface UpdateCompaniesResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Companies | null;
}

export type BadgeType = {
  id: string;
  name: string;
  description: string;
  badge_type_id: string;
  visitor_type_id: string;
  honeywell_id: string;
};

export type GetBadgeTypeResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BadgeType[] | null;
};

export const UpdateBadgeTypeRequestSchema = z.object({
  name: z.string().default('').optional(),
  description: z.string().default('').optional(),
  badge_type_id: z.string().default('').optional(),
  visitor_type_id: z.string().default('').optional(),
  visitor_type: z.string().default('').optional(),
  honeywell_id: z.string().default('').optional(),
  active: z.boolean().default(false).optional(),
});

export type UpdateBadgeTypeRequest = z.infer<typeof UpdateBadgeTypeRequestSchema>;

export interface UpdateBadgeTypeResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BadgeType | null;
}

export type GetBadgeTypeResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BadgeType | null;
};

export type BadgeStatus = {
  id: string;
  name: string;
  description: string;
  badge_status_id: string;
  honeywell_id: string;
};

export type GetBadgeStatusResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BadgeStatus[] | null;
};

export type GetBadgeStatusResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BadgeStatus | null;
};

export type ClearCodes = {
  id: string;
  name: string;
  clearcode_id: string;
  access_control_id: string;
  description: string;
  description2: string;
  description3: string;
  log_devs: string;
  timezone: string;
  elevator_outputs: string;
  honeywell_id: string;
};

export type GetClearCodesResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: ClearCodes[] | null;
};

export type GetClearCodesResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: ClearCodes | null;
};

export type UpdateClearcodesResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: ClearCodes | null;
};

export const UpdateClearcodesRequestSchema = z.object({
  name: z.string().default('').optional(),
  clearcode_id: z.string().default('').optional(),
  access_control_id: z.string().default('').optional(),
  description: z.string().default('').optional(),
  description2: z.string().default('').optional(),
  description3: z.string().default('').optional(),
  log_devs: z.string().default('').optional(),
  timezone: z.string().default('').optional(),
  elevator_outputs: z.string().default('').optional(),
  access_control: z.string().default('').optional(),
  honeywell_id: z.string().default('').optional(),
  active: z.boolean().default(false).optional(),
});

export type UpdateClearcodesRequest = z.infer<typeof UpdateClearcodesRequestSchema>;

// Tracking
export type CardTracking = {
  id: string;
  card_id: string;
  name: string;
  remarks: string;
  cardType: string;
  cardNumber: string;
  dmac: string;
  isMultiMaskedArea: boolean;
  registeredMaskedAreaId?: string;
  isUsed: boolean;
  lastUsed: string;
  visitorId: string;
  memberId: string;
  checkinAt: string;
  checkoutAt: string;
  statusCard: boolean;
};

export type GetCardTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: CardTracking[] | null;
};

export type GetCardTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: CardTracking | null;
};

export type UpdateCardTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: CardTracking | null;
};

export const UpdateCardTrackingRequestSchema = z.object({
  name: z.string().default('').optional(),
  remarks: z.string().default('').optional(),
  cardType: z.string().default('').optional(),
  cardNumber: z.string().default('').optional(),
  dmac: z.string().default('').optional(),
  isMultiMaskedArea: z.boolean().default(false).optional(),
  registeredMaskedAreaId: z.string().default('').optional(),
  isUsed: z.boolean().default(false).optional(),
  lastUsed: z.string().default('').optional(),
  visitorId: z.string().default('').optional(),
  memberId: z.string().default('').optional(),
  checkinAt: z.string().default('').optional(),
  checkoutAt: z.string().default('').optional(),
  statusCard: z.boolean().default(false).optional(),
});
export type UpdateCardTrackingRequest = z.infer<typeof UpdateCardTrackingRequestSchema>;

// visitor
export type VisitorTracking = {
  id: string;
  visitor_id: string;
  personId: string;
  identityId: string;
  identityType: string;
  cardNumber: string;
  bleCardNumber: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  address: string;
  organizationName: string;
  districtName: string;
  departmentName: string;
  isVip: boolean;
  faceImage: string;
  cardId: string;
  uploadFr: number;
  status: string;
};

export type GetVisitorTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: VisitorTracking[] | null;
};

export type GetVisitorTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: VisitorTracking | null;
};

export type UpdateVisitorTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: VisitorTracking | null;
};

export const UpdateVisitorTrackingRequestSchema = z.object({
  personId: z.string().default('').optional(),
  identityId: z.string().default('').optional(),
  identityType: z.string().default('').optional(),
  cardNumber: z.string().default('').optional(),
  bleCardNumber: z.string().default('').optional(),
  name: z.string().default('').optional(),
  phone: z.string().default('').optional(),
  email: z.string().default('').optional(),
  gender: z.string().default('').optional(),
  address: z.string().default('').optional(),
  organizationName: z.string().default('').optional(),
  districtName: z.string().default('').optional(),
  departmentName: z.string().default('').optional(),
  isVip: z.boolean().default(false).optional(),
  faceImage: z.string().default('').optional(),
  cardId: z.string().default('').optional(),
  uploadFr: z.number().default(0).optional(),
  status: z.string().default('').optional(),
  tracking_id: z.string().default('').optional(),
});

export type UpdateVisitorTrackingRequest = z.infer<typeof UpdateVisitorTrackingRequestSchema>;

// Visitor Blacklist Area
export type VisitorBlacklistAreaTracking = {
  id: string;
  visitor_blacklist_area_id: string;
  floorplanMaskedAreaId: string;
  visitorId: string;
};
export type GetVisitorBlacklistAreaTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: VisitorBlacklistAreaTracking[] | null;
};

export type GetVisitorBlacklistAreaTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: VisitorBlacklistAreaTracking | null;
};

export type UpdateVisitorBlacklistAreaTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: VisitorBlacklistAreaTracking | null;
};

export const UpdateVisitorBlacklistAreaTrackingRequestSchema = z.object({
  floorplanMaskedAreaId: z.string().default('').optional(),
  visitorId: z.string().default('').optional(),
});
export type UpdateVisitorBlacklistAreaTrackingRequest = z.infer<
  typeof UpdateVisitorBlacklistAreaTrackingRequestSchema
>;

// Trx Visitor
export type TrxVisitorTracking = {
  id: string;
  trx_visitor_id: string;
  checkedInAt: string;
  checkedOutAt: string;
  denyAt: string;
  blockAt: string;
  unblockAt: string;
  checkinBy: string;
  checkoutBy: string;
  denyBy: string;
  denyReason: string;
  blockBy: string;
  blockReason: string;
  status: string;
  invitationCreatedAt: string;
  vehiclePlateNumber: string;
  remarks: string;
  visitorPeriodStart: string;
  visitorPeriodEnd: string;
  isInvitationAccepted: string;
  invitationCode: string;
  trxStatus: number;
  maskedAreaId: string;
  parkingId: string;
  visitorId: string;
  visitorGroupCode: number;
  visitorNumber: string;
  visitorCode: string;
  memberIdentity: string;
  isMember: boolean;
  agenda: string;
};

export type GetTrxVisitorTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: TrxVisitorTracking[] | null;
};

export type GetTrxVisitorTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: TrxVisitorTracking | null;
};

export type UpdateTrxVisitorTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: TrxVisitorTracking | null;
};

export const UpdateTrxVisitorTrackingRequestSchema = z.object({
  trx_visitor_id: z.string().default('').optional(),
  checkedInAt: z.string().default('').optional(),
  checkedOutAt: z.string().default('').optional(),
  denyAt: z.string().default('').optional(),
  blockAt: z.string().default('').optional(),
  unblockAt: z.string().default('').optional(),
  checkinBy: z.string().default('').optional(),
  checkoutBy: z.string().default('').optional(),
  denyBy: z.string().default('').optional(),
  denyReason: z.string().default('').optional(),
  blockBy: z.string().default('').optional(),
  blockReason: z.string().default('').optional(),
  status: z.string().default('').optional(),
  invitationCreatedAt: z.string().default('').optional(),
  vehiclePlateNumber: z.string().default('').optional(),
  remarks: z.string().default('').optional(),
  visitorPeriodStart: z.string().default('').optional(),
  visitorPeriodEnd: z.string().default('').optional(),
  isInvitationAccepted: z.string().default('').optional(),
  invitationCode: z.string().default('').optional(),
  trxStatus: z.number().default(0).optional(),
  maskedAreaId: z.string().default('').optional(),
  parkingId: z.string().default('').optional(),
  visitorId: z.string().default('').optional(),
  visitorGroupCode: z.number().default(0).optional(),
  visitorNumber: z.string().default('').optional(),
  visitorCode: z.string().default('').optional(),
  memberIdentity: z.string().default('').optional(),
  isMember: z.boolean().default(false).optional(),
  agenda: z.string().default('').optional(),
});

export type UpdateTrxVisitorTrackingRequest = z.infer<typeof UpdateTrxVisitorTrackingRequestSchema>;
// Member
export type MemberTracking = {
  id: string;
  person_id: string;
  organization_id: string;
  derpartment_id: string;
  district_id: string;
  identity_id: string;
  card_number: string;
  ble_card_number: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  address: string;
  face_image: string;
  upload_fr: number;
  upload_fr_error: string;
  birth_date: string;
  join_date: string;
  exit_date: string;
  head_member1: string;
  head_member2: string;
  status_employee: number;
  status: number;
};

export type GetMemberTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: MemberTracking[] | null;
};

export type GetMemberTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: MemberTracking | null;
};

export type UpdateMemberTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: MemberTracking | null;
};

export const UpdateMemberTrackingRequestSchema = z.object({
  person_id: z.string().default('').optional(),
  organization_id: z.string().default('').optional(),
  derpartment_id: z.string().default('').optional(),
  district_id: z.string().default('').optional(),
  identity_id: z.string().default('').optional(),
  card_number: z.string().default('').optional(),
  ble_card_number: z.string().default('').optional(),
  name: z.string().default('').optional(),
  phone: z.string().default('').optional(),
  email: z.string().default('').optional(),
  gender: z.string().default('').optional(),
  address: z.string().default('').optional(),
  face_image: z.string().default('').optional(),
  upload_fr: z.number().default(0).optional(),
  upload_fr_error: z.string().default('').optional(),
  birth_date: z.string().default('').optional(),
  join_date: z.string().default('').optional(),
  exit_date: z.string().default('').optional(),
  head_member1: z.string().default('').optional(),
  head_member2: z.string().default('').optional(),
  status_employee: z.number().default(0).optional(),
  status: z.number().default(0).optional(),
});

export type UpdateMemberTrackingRequest = z.infer<typeof UpdateMemberTrackingRequestSchema>;

// AccessControl Tracking
export type AccessControlTracking = {
  id: string;
  access_control_id: string;
  brandId: string;
  name: string;
  type: string;
  description: string;
  channel: string;
  doorId: string;
  raw: string;
  integrationId: string;
};

export type GetAccessControlTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AccessControlTracking[] | null;
};

export type GetAccessControlTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AccessControlTracking | null;
};

export type UpdateAccessControlTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AccessControlTracking | null;
};

export const UpdateAccessControlTrackingRequestSchema = z.object({
  brandId: z.string().default('').optional(),
  name: z.string().default('').optional(),
  type: z.string().default('').optional(),
  description: z.string().default('').optional(),
  channel: z.string().default('').optional(),
  doorId: z.string().default('').optional(),
  raw: z.string().default('').optional(),
  integrationId: z.string().default('').optional(),
});
export type UpdateAccessControlTrackingRequest = z.infer<
  typeof UpdateAccessControlTrackingRequestSchema
>;

export type BrandTracking = {
  id: string;
  brand_id: string;
  name: string;
  tag: string;
  appliation_id: string;
  status: number;
};

export type GetBrandTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BrandTracking[] | null;
};

export type GetBrandTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BrandTracking | null;
};

export type UpdateBrandTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BrandTracking | null;
};

export const UpdateBrandTrackingRequestSchema = z.object({
  name: z.string().default('').optional(),
  tag: z.string().default('').optional(),
  status: z.number().default(0).optional(),
});

export type UpdateBrandTrackingRequest = z.infer<typeof UpdateBrandTrackingRequestSchema>;

// Floor plan
export type OrganizationTracking = {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  host: string;
  // status: number;
};

export type GetOrganizationTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: OrganizationTracking[] | null;
};

export type GetOrganizationTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: OrganizationTracking | null;
};

export type UpdateOrganizationTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: OrganizationTracking | null;
};

export const UpdateOrganizationTrackingRequestSchema = z.object({
  organization_id: z.string().default('').optional(),
  name: z.string().default('').optional(),
  code: z.string().default('').optional(),
  host: z.string().default('').optional(),
  // status: z.number().default(0).optional(),
});
export type UpdateOrganizationTrackingRequest = z.infer<
  typeof UpdateOrganizationTrackingRequestSchema
>;

// District
export type DistrictTracking = {
  id: string;
  district_id: string;
  name: string;
  code: string;
  districtHost: string;
  status: number;
};
export type GetDistrictTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: DistrictTracking[] | null;
};

export type GetDistrictTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: DistrictTracking | null;
};

export type UpdateDistrictTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: DistrictTracking | null;
};

export const UpdateDistrictTrackingRequestSchema = z.object({
  name: z.string().default('').optional(),
  code: z.string().default('').optional(),
  districtHost: z.string().default('').optional(),
  status: z.number().default(0).optional(),
});
export type UpdateDistrictTrackingRequest = z.infer<typeof UpdateDistrictTrackingRequestSchema>;

// Department
export type DepartmentTracking = {
  id: string;
  department_id: string;
  name: string;
  code: string;
  departmentHost: string;
  status: number;
};

export type GetDepartmentTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: DepartmentTracking[] | null;
};

export type GetDepartmentTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: DepartmentTracking | null;
};

export type UpdateDepartmentTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: DepartmentTracking | null;
};

export const UpdateDepartmentTrackingRequestSchema = z.object({
  name: z.string().default('').optional(),
  code: z.string().default('').optional(),
  departmentHost: z.string().default('').optional(),
  status: z.number().default(0).optional(),
});
export type UpdateDepartmentTrackingRequest = z.infer<typeof UpdateDepartmentTrackingRequestSchema>;

export type BuildingTracking = {
  id: string;
  building_id: string;
  name: string;
  image: string;
  status: number;
};

export type GetBuildingTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BuildingTracking[] | null;
};

export type GetBuildingTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BuildingTracking | null;
};

export type UpdateBuildingTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BuildingTracking | null;
};

export const UpdateBuildingTrackingRequestSchema = z.object({
  name: z.string().default('').optional(),
  image: z.string().default('').optional(),
  status: z.number().default(0).optional(),
});

export type UpdateBuildingTrackingRequest = z.infer<typeof UpdateBuildingTrackingRequestSchema>;

// Floor
export type FloorTracking = {
  id: string;
  floor_id: string;
  building_id: string;
  name: string;
  floor_image: string;
  pixelX: number;
  pixelY: number;
  floorX: number;
  floorY: number;
  meterPerPx: number;
  engineFloorId: string;
  status: number;
};

export type GetFloorTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: FloorTracking[] | null;
};

export type GetFloorTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: FloorTracking | null;
};

export type UpdateFloorTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: FloorTracking | null;
};

export const UpdateFloorTrackingRequestSchema = z.object({
  building_id: z.string().default('').optional(),
  name: z.string().default('').optional(),
  floor_image: z.string().default('').optional(),
  pixelX: z.number().default(0).optional(),
  pixelY: z.number().default(0).optional(),
  floorX: z.number().default(0).optional(),
  floorY: z.number().default(0).optional(),
  meterPerPx: z.number().default(0).optional(),
  engineFloorId: z.string().default('').optional(),
  status: z.number().default(0).optional(),
});
export type UpdateFloorTrackingRequest = z.infer<typeof UpdateFloorTrackingRequestSchema>;

export type FloorPlanTracking = {
  id: string;
  floorplan_id: string;
  name: string;
  floorId: string;
  status: number;
  maskedAreaCount: number;
  deviceCount: number;
};

export type GetFloorPlanTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: FloorPlanTracking[] | null;
};

export type GetFloorPlanTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: FloorPlanTracking | null;
};

export type UpdateFloorPlanTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: FloorPlanTracking | null;
};

export const UpdateFloorPlanTrackingRequestSchema = z.object({
  name: z.string().default('').optional(),
  floorplan_id: z.string().default('').optional(),
  floorId: z.string().default('').optional(),
  status: z.number().default(0).optional(),
  maskedAreaCount: z.number().default(0).optional(),
  deviceCount: z.number().default(0).optional(),
});
export type UpdateFloorPlanTrackingRequest = z.infer<typeof UpdateFloorPlanTrackingRequestSchema>;

// Floor Plan Masked Area
export type FloorPlanMaskedAreaTracking = {
  id: string;
  trk_floorplan_masked_area_id: string;
  floorplan_id: string;
  floor_id: string;
  name: string;
  area_shape: string;
  color_area: string;
  restricted_status: string;
  integration_id: string;
  site_id: string;
  active: boolean;
};

export type GetFloorPlanMaskedAreaTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: FloorPlanMaskedAreaTracking[] | null;
};

export type GetFloorPlanMaskedAreaTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: FloorPlanMaskedAreaTracking | null;
};

export type UpdateFloorPlanMaskedAreaTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: FloorPlanMaskedAreaTracking | null;
};

export const UpdateFloorPlanMaskedAreaTrackingRequestSchema = z.object({
  floorplan_maskedarea_id: z.string().default('').optional(),
  floorplanId: z.string().default('').optional(),
  floorId: z.string().default('').optional(),
  name: z.string().default('').optional(),
  areaShape: z.string().default('').optional(),
  colorArea: z.string().default('').optional(),
  restrictedStatus: z.string().default('').optional(),
  engineAreaId: z.string().default('').optional(),
  status: z.number().default(0).optional(),
});
export type UpdateFloorPlanMaskedAreaTrackingRequest = z.infer<
  typeof UpdateFloorPlanMaskedAreaTrackingRequestSchema
>;

// Floor Plan Device
export type FloorPlanDeviceTracking = {
  id: string;
  fp_device_id: string;
  floorplanId: string;
  accessCctvId: string;
  readerId: string;
  accessControlId: string;
  posX: number;
  posY: number;
  posPxX: number;
  posPxY: number;
  floorplanMaskedAreaId: string;
  name: string;
  type: string;
  deviceStatus: string;
  status: number;
};

export type GetFloorPlanDeviceTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: FloorPlanDeviceTracking[] | null;
};

export type GetFloorPlanDeviceTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: FloorPlanDeviceTracking | null;
};

export type UpdateFloorPlanDeviceTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: FloorPlanDeviceTracking | null;
};

export const UpdateFloorPlanDeviceTrackingRequestSchema = z.object({
  fp_device_id: z.string().default('').optional(),
  floorplanId: z.string().default('').optional(),
  accessCctvId: z.string().default('').optional(),
  readerId: z.string().default('').optional(),
  accessControlId: z.string().default('').optional(),
  posX: z.number().default(0).optional(),
  posY: z.number().default(0).optional(),
  posPxX: z.number().default(0).optional(),
  posPxY: z.number().default(0).optional(),
  floorplanMaskedAreaId: z.string().default('').optional(),
  name: z.string().default('').optional(),
  type: z.string().default('').optional(),
  deviceStatus: z.string().default('').optional(),
  status: z.number().default(0).optional(),
});

export type UpdateFloorPlanDeviceTrackingRequest = z.infer<
  typeof UpdateFloorPlanDeviceTrackingRequestSchema
>;

export type BleReaderTracking = {
  id: string;
  ble_reader_id: string;
  brandId: string;
  name: string;
  ip: string;
  gmac: string;
  engineReaderId: string;
  status: number;
};

export type GetBleReaderTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BleReaderTracking[] | null;
};

export type GetBleReaderTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BleReaderTracking | null;
};

export type UpdateBleReaderTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: BleReaderTracking | null;
};

export const UpdateBleReaderTrackingRequestSchema = z.object({
  brandId: z.string().default('').optional(),
  name: z.string().default('').optional(),
  ip: z.string().default('').optional(),
  gmac: z.string().default('').optional(),
  engineReaderId: z.string().default('').optional(),
  status: z.number().default(0).optional(),
});

export type UpdateBleReaderTrackingRequest = z.infer<typeof UpdateBleReaderTrackingRequestSchema>;

// Alarm

export type AlarmTracking = {
  id: string;
  visitorId: string;
  readerId: number;
  floorplanMaskedAreaId: string;
  alarm: string;
  action: string;
  idleTimestamp: string;
  doneTimestamp: string;
  cancelTimestamp: string;
  waitingTimestamp: string;
  investigatedTimestamp: string;
  investigatedDoneAt: string;
  idleBy: string;
  doneBy: string;
  cancelBy: string;
  waitingBy: string;
  investigatedBy: string;
  investigatedResult: string;
};

export type GetAlarmTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AlarmTracking[] | null;
};

export type GetAlarmTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AlarmTracking | null;
};

export type UpdateAlarmTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AlarmTracking | null;
};

export const UpdateAlarmTrackingRequestSchema = z.object({
  visitorId: z.string().default('').optional(),
  readerId: z.number().default(0).optional(),
  floorplanMaskedAreaId: z.string().default('').optional(),
  alarm: z.string().default('').optional(),
  action: z.string().default('').optional(),
  idleTimestamp: z.string().default('').optional(),
  doneTimestamp: z.string().default('').optional(),
  cancelTimestamp: z.string().default('').optional(),
  waitingTimestamp: z.string().default('').optional(),
  investigatedTimestamp: z.string().default('').optional(),
  investigatedDoneAt: z.string().default('').optional(),
  idleBy: z.string().default('').optional(),
  doneBy: z.string().default('').optional(),
  cancelBy: z.string().default('').optional(),
  waitingBy: z.string().default('').optional(),
  investigatedBy: z.string().default('').optional(),
  investigatedResult: z.string().default('').optional(),
  tracking_id: z.string().default('').optional(),
});

export type UpdateAlarmTrackingRequest = z.infer<typeof UpdateAlarmTrackingRequestSchema>;

// Alarm Warning
export type AlarmWarningTracking = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};

export type GetAlarmWarningTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AlarmWarningTracking[] | null;
};

export type GetAlarmWarningTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AlarmWarningTracking | null;
};

export type UpdateAlarmWarningTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AlarmWarningTracking | null;
};

// export const UpdateAlarmWarningTrackingRequestSchema = z.object({
//   createdAt: z.string().default('').optional(),
//   updatedAt: z.string().default('').optional(),
//   deletedAt: z.string().default('').optional(),
// });

// export type UpdateAlarmWarningTrackingRequest = z.infer<
//   typeof UpdateAlarmWarningTrackingRequestSchema
// >;
// CCTV

export type CctvTracking = {
  id: string;
  access_cctv_id: string;
  name: string;
  rtsp: string;
  integrationid: string;
  status: number;
};

export type GetCctvTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: CctvTracking[] | null;
};

export type GetCctvTrackingResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: CctvTracking | null;
};

export type UpdateCctvTrackingResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: CctvTracking | null;
};

export const UpdateCctvTrackingRequestSchema = z.object({
  name: z.string().default('').optional(),
  rtsp: z.string().default('').optional(),
  integrationid: z.string().default('').optional(),
  status: z.number().default(0).optional(),
});
export type UpdateCctvTrackingRequest = z.infer<typeof UpdateCctvTrackingRequestSchema>;

// Tracking Transaction

export type TrackingTransaction = {
  id: string;
  brand_id: string;
  name: string;
  type: string;
  description: string;
  channel: string;
  door_id: string;
  raw: string;
  integration_id: string;
  status: number;
};

export type GetTrackingTransactionResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: TrackingTransaction[] | null;
};

export type GetTrackingTransactionResponseById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: TrackingTransaction | null;
};
