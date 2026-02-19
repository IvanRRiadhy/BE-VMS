import { SubmitPraForm } from './../users';
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
  user_group_id: string;
  email: string;
  username: string;
  fullname: string;
  description: string;
  access: string;
  token: string;
  employee_id: string;
  distributor_id: string;
  menu: any[];
  groupAccess: GroupAccess[];
  id: string;
  status: number;
  type?: number;
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
export type AuthVisitorRequest = {
  code: string;
};

export type PraformRequest = {
  id: string;
};
export interface VisitorQuestionForm {
  sort: number;
  short_name: string;
  long_display_text: string;
  field_type: number;
  remarks: string;
  answer_text?: string | null;
  answer_datetime?: string | null;
  answer_file?: string | null;
  form_visitor_type_id?: string;
}

export interface VisitorQuestionPage {
  id: string | null;
  sort: number;
  name: string;
  is_document: boolean;
  can_multiple_used: boolean;
  foreign_id: string;
  self_only: boolean;
  form: VisitorQuestionForm[];
}

export interface AuthVisitorCollection {
  // status: string;
  token?: string;
  question_page: VisitorQuestionPage[];
  agenda: string;
  host: string;
  group_code: string;
  visitor_period_start: string;
  visitor_period_end: string;
  group_name: string;
  visitor_number: string;
  visitor_code: string;
  invitation_code: string | null;
  site_place: string;
  visitor_status: string;
  visitor: {
    id: string;
    name: string;
    email: string;
    organization: string;
    phone: string;
    gender: string;
    identity_id: string;
  };
  id: string;
}

export interface AuthVisitorResponse {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: AuthVisitorCollection;
}
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
