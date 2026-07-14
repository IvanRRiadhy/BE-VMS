import { start } from 'repl';
import axiosInstance from 'src/customs/api/interceptor';

export const getAllApprovalWorkflow = async (): Promise<any> => {
  const response = await axiosInstance.get('/approval-workflow');
  return response.data;
};

// by id
export const getApprovalWorkflowById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/approval-workflow/${id}`);
  return response.data;
};

// by dt
export const getApprovalWorkflowByDt = async (
  start: number,
  length: number,
  sort_dir?: string,
  keyword?: string,
): Promise<any> => {
  if (keyword) keyword = keyword.trim();

  const params: any = {
    start,
    length,
    sort_dir,
  };

  if (keyword) {
    params['search[value]'] = keyword;
  }

  const response = await axiosInstance.get('/approval-workflow/dt', {
    params,
  });

  return response.data;
};
// create
export const createApprovalWorkflow = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/approval-workflow', data);
  return response.data;
};

// update
export const updateApprovalWorkflow = async (id: string, data: any): Promise<any> => {
  const response = await axiosInstance.put(`/approval-workflow/${id}`, data);
  return response.data;
};

// delete
export const deleteApprovalWorkflow = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/approval-workflow/${id}`);
  return response.data;
};

// Get Approval Manager and Employee

export const getApprovalTicket = async (options?: {
  start?: number;
  length?: number;
  sort_dir?: string;
  keyword?: string;
  entity_type?: string;
  approval_status?: string;
  entity_id?: string;
}): Promise<any> => {
  const params: any = {
    'entity-type': options?.entity_type ?? 'Invitation',
  };

  if (options?.start !== undefined) {
    params.start = options.start;
  }

  if (options?.length !== undefined) {
    params.length = options.length;
  }

  if (options?.sort_dir) {
    params.sort_dir = options.sort_dir;
  }

  if (options?.keyword) {
    params['search[value]'] = options.keyword;
  }

  if (options?.approval_status) {
    params['approval-status'] = options.approval_status;
  }

  if (options?.entity_id) {
    params['entity-id'] = options.entity_id;
  }

  const response = await axiosInstance.get(`/approval-ticket/with-actors/dt`, {
    params,
  });

  return response.data;
};

// Approve
export const approveTicket = async (id: string): Promise<any> => {
  const response = await axiosInstance.post(
    '/approval-ticket/' + id + '/approve',
    // {},
    // null,
    null,
  );
  return response.data;
};

// Reject
export const rejectTicket = async (id: string): Promise<any> => {
  const response = await axiosInstance.post(`/approval-ticket/${id}/reject`, null);
  return response.data;
};

// Approve meeting host
export const approveMeetingHost = async (
  id: string,
  payload: any,
): Promise<any> => {
  const response = await axiosInstance.post(
    `/approval-ticket/${id}/approve-meetinghost`,
    payload,
  );
  return response.data;
};

export const getVisitorByTickedId = async ( id: string): Promise<any> => {
  const response = await axiosInstance.get(`/approval-ticket/${id}/visitors`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};
