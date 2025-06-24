export type Item = {
  person_id: string;
  indentity_id: string;
  card_number: string;
  ble_card_number: string;
  type: number;
  name: string;
  phone: string;
  email: string;
  gender: number;
  address: string;
  upload_fr: number;
  qr_code: string;
  faceimage: string;
  access_area: string;
  access_area_special: string;
  birth_date: string; // ISO date format, e.g. "2025-06-16"
  join_date: string;
  exit_date: string;
  is_head: boolean;
  head_employee_1: string;
  head_employee_2: string;
  organization_id: string;
  department_id: string;
  district_id: string | null;
  is_email_verify: boolean;
  id: string;
};

export type GetAllEmployeePaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};
