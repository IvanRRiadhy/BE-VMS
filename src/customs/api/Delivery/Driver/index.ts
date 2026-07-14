import axios from 'axios';
import axiosInstance from 'src/customs/api/interceptor';
import {
  CreateDriverRequest,
  CreateDriverResponse,
  DeleteDriverResponse,
  GetAllDriverPaginationResponse,
  GetAllDriverResponse,
  UpdateDriverRequest,
  UpdateDriverResponse,
  UploadImageDriverResponse,
} from '../../models/Admin/Driver';
import { ValidationErrorResponse } from '../../models/Admin/Department';
//#region Driver API

export const getAllDriver = async (): Promise<GetAllDriverResponse> => {
  const response = await axiosInstance.get(`/deliverystaff`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getVisitorDriver = async (
  deliveryScheduleId: string,
): Promise<GetAllDriverResponse> => {
  const params = { 'delivery-schedule-id': deliveryScheduleId };
  const response = await axiosInstance.get(`/deliverystaff/get-visitor-employee`, {
    headers: { Accept: 'application/json' },
    params,
  });
  return response.data;
};

export const getFormDriver = async (
  status_employee?: string, // 🔹 dibuat opsional
): Promise<GetAllDriverResponse> => {
  try {
    const params: Record<string, any> = {};

    if (status_employee) params['status-employee'] = status_employee;

    const response = await axiosInstance.get(`/deliverystaff`, {
      headers: {
        Accept: 'application/json',
      },
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

export const getDriverById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/deliverystaff/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getAllDriverPagination = async (
  start: number,
  length: number,
  sortColumn?: string,
  sortDir?: string,
  keyword: string = '',
): Promise<GetAllDriverPaginationResponse> => {
  const response = await axiosInstance.get(`/deliverystaff/dt`, {
    params: { start, length, sort_column: sortColumn, sort_dir: sortDir, 'search[value]': keyword },
    headers: {
      Accept: 'application/json',
    },
  });

  return response.data;
};

export const getAllDriverPaginationFilterMore = async (
  start: number,
  length: number,
  sortColumn: string,
  sortDir?: string,
  keyword: string = '',
  gender?: number,
  joinStart?: string,
  exitEnd?: string,
  statusDriver?: number,
  // isHead?: boolean,
  organization?: string,
  district?: string,
  department?: string,
): Promise<GetAllDriverPaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    sort_column: sortColumn,
    sort_dir: sortDir,
  };
  if (keyword) params['search[value]'] = keyword;
  if (gender !== undefined && gender !== -1) params.gender = gender;
  if (joinStart) params['join-start'] = joinStart;
  if (exitEnd) params['exit-end'] = exitEnd;
  if (statusDriver !== undefined && statusDriver !== -1) params['status-employee'] = statusDriver;
  if (organization && organization !== '0' && organization !== '')
    params.organization = organization;
  if (district && district !== '0' && district !== '') params.district = district;
  if (department && department !== '0' && department !== '') params.department = department;

  const response = await axiosInstance.get(`/deliverystaff/dt`, {
    params,
  });

  return response.data;
};

export const createDriver = async (data: CreateDriverRequest): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/deliverystaff`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const updateDriver = async (
  employeeId: string,
  data: UpdateDriverRequest,
): Promise<UpdateDriverResponse> => {
  try {
    const response = await axiosInstance.put(`/deliverystaff/${employeeId}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const deleteDriver = async (employeeId: string): Promise<DeleteDriverResponse> => {
  const response = await axiosInstance.delete(`/deliverystaff/${employeeId}`);
  return response.data;
};

export const uploadImageDriver = async (
  employeeId: string,
  data: File,
): Promise<UploadImageDriverResponse> => {
  try {
    const formData = new FormData();
    formData.append('faceimage', data);
    const response = await axiosInstance.post(`/deliverystaff/upload/${employeeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

//#endregion
