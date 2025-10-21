import { z } from 'zod';

export type Item = {
  fullname: string | null;
  card_number: string | null;
  qr_access: string | null;
  agenda: string | null;
  initial_trx_code: string;
  host: string;
  is_group: boolean;
  group_code: string;
  group_name: string;
  visitor_period_start: string | null; // ISO string
  visitor_period_end: string | null; // ISO string
  visitor_number: string;
  visitor_code: string;
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
  invitation_created_at: string; // ISO string
  vehicle_plate_number: string | null;
  vehicle_type: string | null;
  remarks: string | null;
  site_place: string | null;
  parking_id: string | null;
  parking_slot: string | null;
  parking_block: string | null;
  parking_area: string | null;
  visitor_id: string;
  identity_image: string | null;
  selfie_image: string | null;
  nda: string | null;
  can_track_ble: boolean | null;
  can_track_cctv: boolean | null;
  can_parking: boolean | null;
  can_access: boolean | null;
  can_meeting: boolean | null;
  tz: string | null;
  visitor_type: string | null;
  is_praregister_done: boolean;
  extend_visitor_period: string | null;
  site_place_name: string | null;
  host_name: string | null;
  is_driving: boolean | null;
};
