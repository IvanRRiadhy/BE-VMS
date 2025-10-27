import axios from 'axios';
import axiosInstance from './interceptor';
import {
  CreateApprovalRequest,
  GetAllApproval,
  GetAllApprovalPaginationResponse,
  GetApprovalById,
} from './models/Manager/Approval';

export const getApproval = async (
  token: string,
  start_date?: string,
  end_date?: string,
  is_action?: boolean,
  site_approval?: number,
  approval_type?: string,
): Promise<GetAllApproval> => {
  try {
    const params: Record<string, any> = {};

    // ✅ gunakan dash agar sesuai dengan backend
    if (start_date) params['start-date'] = start_date;
    if (end_date) params['end-date'] = end_date;
    if (typeof is_action === 'boolean') params['is-action'] = is_action;
    if (typeof site_approval === 'number') params['site-approval'] = site_approval;
    if (approval_type) params['approval-type'] = approval_type;

    const response = await axiosInstance.get('/approval', {
      headers: { Authorization: `Bearer ${token}` },
      ...(Object.keys(params).length > 0 && { params }), // ✅ hanya ditambahkan jika ada isi
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getApprovalById = async (id: string, token: string): Promise<GetApprovalById> => {
  try {
    const response = await axiosInstance.get(`/approval/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getAllApprovalDT = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
  start_date?: string,
  end_date?: string,
  is_action?: boolean,
  site_approval?: number,
  approval_type?: string,
): Promise<GetAllApprovalPaginationResponse> => {
  try {
    const params: Record<string, any> = {};

    // ✅ hanya tambahkan jika ada nilai
    if (typeof start === 'number') params.start = start;
    if (typeof length === 'number') params.length = length;
    if (sortColumn) params.sortColumn = sortColumn;
    if (keyword) params.keyword = keyword;
    if (start_date) params['start-date'] = start_date;
    if (end_date) params['end-date'] = end_date;
    if (typeof is_action === 'boolean') params['is-action'] = is_action;
    if (typeof site_approval === 'number') params['site-approval'] = site_approval;
    if (approval_type) params['approval-type'] = approval_type;

    const response = await axiosInstance.get('/approval/dt', {
      headers: { Authorization: `Bearer ${token}` },
      ...(Object.keys(params).length > 0 && { params }),
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const createApproval = async (token: string, data: CreateApprovalRequest): Promise<any> => {
  try {
    const response = await axiosInstance.post('/approval', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};
