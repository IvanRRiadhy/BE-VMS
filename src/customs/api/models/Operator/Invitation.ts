import { z } from 'zod';

export type Visitor = {
  visitor_type: string;
  identity_id: string;
  name: string;
  email: string;
  organization: string;
  gender: string;
  address: string | null;
  phone: string;
  is_vip: boolean | null;
  is_email_verified: boolean;
  email_verification_send_at: string | null;
  email_verification_token: string;
  visitor_period_start: string | null;
  visitor_period_end: string | null;
  is_employee: boolean;
  employee_id: string | null;
  employee: any | null;
  id: string;
};

export type Item = {
  id: string;
  agenda: string;
  initial_trx_code: string;
  host: string;
  group_code: string;
  visitor_period_start: string;
  visitor_period_end: string;
  group_name: string;
  visitor_number: string;
  visitor_code: string;
  visitor_card: string | null;
  visitor_face: string | null;
  visitor_ble_card: string | null;
  invitation_code: string;
  meeting_code: string | null;
  self_only: boolean;
  checkin_at: string | null;
  checkout_at: string | null;
  deny_at: string | null;
  block_at: string | null;
  unblock_at: string | null;
  checkin_by: string | null;
  checkout_by: string | null;
  deny_by: string | null;
  deny_reason: string | null;
  block_by: string | null;
  block_reason: string | null;
  visitor_status: string;
  invitation_created_at: string;
  is_driving: boolean | null;
  vehicle_plate_number: string | null;
  vehicle_type: string | null;
  remarks: string | null;
  site_place: string;
  parking_id: string | null;
  visitor_id: string;
  identity_image: string | null;
  selfie_image: string | null;
  nda: string | null;
  can_track_ble: boolean | null;
  can_track_cctv: boolean | null;
  can_parking: boolean | null;
  can_access: boolean;
  can_meeting: boolean | null;
  tz: string;
  is_group: boolean;
  visitor_type: string;
  is_praregister_done: boolean;
  application_id: string;
  extend_visitor_period: string | null;
  site_place_name: string;
  host_name: string;
  is_block: boolean | null;
  visitor: Visitor;
  parking: any | null;
  card: Card[];
  access: any | null;
};

export type Card = {
  card_number: string;
  card_barcode: string;
  card_mac: string;
  is_ble: boolean;
  is_employee_used: boolean;
  trx_visitor_id: string;
  visitor_id: string;
  visitor_name: string;
  start_used_at: string;
  end_used_at: string;
  last_position_track: string;
  id: string;
};

export type GetInvitationCodeResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: {
    data: Item[];
    'search-match': string;
  };
};

export const CreateInvitationActionOperatorSchema = z.object({
  action: z.string(),
  reason: z.string().optional().default(''),
});

export type CreateInvitationActionOperatorRequest = z.infer<
  typeof CreateInvitationActionOperatorSchema
>;

export const CreateMultipleInvitationOperatorSchema = z.object({
  data: z.array(
    z.object({
      trx_visitor_id: z.string().optional().default(''),
      action: z.string().optional().default(''),
      reason: z.string().optional().default(''),
    }),
  ),
});
export type CreateMultipleInvitationOperatorRequest = z.infer<
  typeof CreateMultipleInvitationOperatorSchema
>;
