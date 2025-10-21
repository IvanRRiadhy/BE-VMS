import { z } from 'zod';

export type Item = {
  id: string;
  trx_visitor_id: string;
  trx_visitor_code: string | null;
  visitor_id: string;
  visitor_name: string | null;
  site_approval: number;
  is_action: boolean;
  approval_type: string;
  action_at: string | null;
  action_by: string | null;
  action: string | null;
  user_id: string | null;
  user_name: string | null;
  employee_id: string | null;
  employee_name: string | null;
  is_employee: boolean;

  visitor?: {
    name: string;
  };

  trx_visitor?: {
    host: string;
    site_place_name: string;
    agenda: string;
    visitor_period_start: string;
    visitor_period_end: string;
  };
};

export const CreateApprovalSchema = z.object({
  action: z.string(),
});

export type CreateApprovalRequest = z.infer<typeof CreateApprovalSchema>;

export type GetAllApproval = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type GetAllApprovalPaginationResponse = {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item[];
};

export type CreateApprovalResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};

export type GetApprovalById = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: Item | null;
};
