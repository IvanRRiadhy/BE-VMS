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

export const getAllDriver = async (token: string): Promise<GetAllDriverResponse> => {
  const response = await axiosInstance.get(`/deliverystaff`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getVisitorDriver = async (
  token: string,
  deliveryScheduleId: string,
): Promise<GetAllDriverResponse> => {
  const params = { 'delivery-schedule-id': deliveryScheduleId };
  const response = await axiosInstance.get(`/deliverystaff/get-visitor-employee`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const getFormDriver = async (
  token: string,
  status_employee?: string, // 🔹 dibuat opsional
): Promise<GetAllDriverResponse> => {
  try {
    const params: Record<string, any> = {};

    // ✅ hanya tambahkan jika ada nilainya
    if (status_employee) params['status-employee'] = status_employee;

    const response = await axiosInstance.get(`/deliverystaff`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
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

export const getDriverById = async (id: string, token: string): Promise<any> => {
  const response = await axiosInstance.get(`/deliverystaff/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getAllDriverPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn?: string,
  sortDir?: string,
  keyword: string = '',
): Promise<GetAllDriverPaginationResponse> => {
  // const params: Record<string, any> = {
  //   start,
  //   length,
  //   sort_column: sortColumn,
  //   'search[value]': keyword, // ← ini memang harus pakai tanda kurung
  // };

  const response = await axiosInstance.get(`/deliverystaff/dt`, {
    params: { start, length, sort_column: sortColumn, sort_dir: sortDir, 'search[value]': keyword },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  return response.data;
};

export const getAllDriverPaginationFilterMore = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  sortDir?: string,
  keyword: string = '',
  gender?: number,
  joinStart?: string,
  // joinEnd?: string,
  // exitStart?: string,
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
    'search[value]': keyword,
    'join-start': joinStart,
    'exit-end': exitEnd,
    'status-employee': statusDriver,
    organization,
    district,
    department,
  };

  if (gender !== undefined) params.gender = gender;
  if (statusDriver !== undefined) params['status-employee'] = statusDriver;
  if (organization && organization !== '0') params.organization = organization;
  if (district && district !== '0') params.district = district;
  if (department && department !== '0') params.department = department;
  if (joinStart) params.join_start = joinStart;
  if (exitEnd) params.exit_end = exitEnd;

  const response = await axiosInstance.get(`/deliverystaff/dt`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const createDriver = async (data: CreateDriverRequest, token: string): Promise<any> => {
  try {
    console.log(data);
    const response = await axiosInstance.post(`/deliverystaff`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
  token: string,
): Promise<UpdateDriverResponse> => {
  try {
    const response = await axiosInstance.put(`/deliverystaff/${employeeId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const deleteDriver = async (
  employeeId: string,
  token: string,
): Promise<DeleteDriverResponse> => {
  const response = await axiosInstance.delete(`/deliverystaff/${employeeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const uploadImageDriver = async (
  employeeId: string,
  data: File,
  token: string,
): Promise<UploadImageDriverResponse> => {
  try {
    const formData = new FormData();
    formData.append('faceimage', data);
    const response = await axiosInstance.post(`/deliverystaff/upload/${employeeId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload Image Site Response:', response.data);
    console.log('The Data: ', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

//#endregion
