import { z } from 'zod';

export type Item = {
  id: string;
  approval_type: string;
  site_approval: number;
  is_action: boolean;
  start_dare: string;
  end_date: string;
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
