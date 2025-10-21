export type Item = {
  id: string;
  fullname: string;
  username: string;
  email: string;
  group_name: string;
  gender: string;
  address: string;
  phone: string;
  is_vip: boolean;
  is_email_verified: boolean;
  organization_name: string;
  district_name: string;
  department_name: string;
};

export type GetProfileResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};
