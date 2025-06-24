// LOGIN
export type LoginRequest = {
  username: string;
  password: string;
};
export interface GroupAccess {
  group_id: string;
  access_code: string;
  is_private: number;
  userId: string | null;
  id: string;
  status: number;
}

export interface LoginResponseCollection {
  organization_id: string;
  group_id: string;
  email: string;
  username: string;
  fullname: string;
  description: string;
  access: string;
  token: string;
  employee_id: string;
  distributor_id: string;
  menu: any[]; // Ubah `any` ke tipe yang lebih spesifik jika tahu struktur menu
  groupAccess: GroupAccess[];
  id: string;
  status: number;
}

export interface LoginResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: LoginResponseCollection;
}

// REFRESH
export type RefreshTokenRequest = {
  token: string;
};
export interface RefreshTokenResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: {
    token: string;
  };
}

// REVOKE OR LOGOUT
export type RevokeTokenResponse = {
  status: 'success' | 'error';
  status_code: number;
  title: string;
  msg: string;
  collection: any | null;
};
