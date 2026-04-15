import { start } from 'repl';
import axiosInstance from 'src/customs/api/interceptor';

export const getAllApprovalWorkflow = async (token: string): Promise<any> => {
  const response = await axiosInstance.get('/approval-workflow', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// by id
export const getApprovalWorkflowById = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.get(`/approval-workflow/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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
export const createApprovalWorkflow = async (token: string, data: any): Promise<any> => {
  const response = await axiosInstance.post('/approval-workflow', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// update
export const updateApprovalWorkflow = async (
  token: string,
  id: string,
  data: any,
): Promise<any> => {
  const response = await axiosInstance.put(`/approval-workflow/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// delete
export const deleteApprovalWorkflow = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/approval-workflow/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get Approval Manager and Employee
export const getApprovalTicket = async (
  token: string,
  start: number,
  length: number,
  sort_dir?: string,
  keyword?: string,
  entity_type?: string,
  approval_status?: string,
  entity_id?: string,
): Promise<any> => {
  const params: any = {
    start,
    length,
    sort_dir,
    'entity-type': 'Invitation',
  };

  if (keyword) {
    params['search[value]'] = keyword;
  }

  if (approval_status) {
    params['approval-status'] = approval_status;
  }

  const response = await axiosInstance.get(`/approval-ticket/with-actors/dt`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

// Approve
export const approveTicket = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.post(
    `/approval-ticket/${id}/approve`,
    // {}, 
    null,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

// Reject
export const rejectTicket = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.post(
    `/approval-ticket/${id}/reject`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};
