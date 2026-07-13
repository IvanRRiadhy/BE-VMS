import { start } from 'repl';
import axiosInstance from 'src/customs/api/interceptor';

export const getAllApprovalWorkflow = async (token: string): Promise<any> => {
  const response = await axiosInstance.get('/approval-workflow', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// by id
export const getApprovalWorkflowById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/approval-workflow/${id}`);
  return response.data;
};

// by dt
export const getApprovalWorkflowByDt = async (
  token: string,
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
    headers: { Authorization: `Bearer ${token}` },
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

export const getApprovalTicket = async (
  token: string | null,
  options?: {
    start?: number;
    length?: number;
    sort_dir?: string;
    keyword?: string;
    entity_type?: string;
    approval_status?: string;
    entity_id?: string;
  },
): Promise<any> => {
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });

  return response.data;
};

// Approve
export const approveTicket = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.post(
    '/approval-ticket/' + id + '/approve',
    // {},
    // null,
    null,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

// Reject
export const rejectTicket = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.post(`/approval-ticket/${id}/reject`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Approve meeting host
export const approveMeetingHost = async (
  token: string | null,
  id: string,
  payload: any,
): Promise<any> => {
  const response = await axiosInstance.post(`/approval-ticket/${id}/approve-meetinghost`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getVisitorByTickedId = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.get(`/approval-ticket/${id}/visitors`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};
