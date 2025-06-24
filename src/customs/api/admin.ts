import axios from 'axios';
import {
  CreateDepartmentRequest,
  CreateDepartmentResponse,
  DeleteDepartmentResponse,
  GetAllDepartmetsPaginationResponse,
  UpdateDepartmentRequest,
  UpdateDepartmentResponse,
  ValidationErrorResponse,
} from './models/Department';
import {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  DeleteOrganizationResponse,
  GetAllOrgaizationsPaginationResponse,
  UpdateOrganizationRequest,
  UpdateOrganizationResponse,
} from './models/Organization';
import {
  CreateDistrictRequest,
  CreateDistrictResponse,
  DeleteDistrictResponse,
  GetAllDistrictsPaginationResponse,
  UpdateDistrictRequest,
  UpdateDistrictResponse,
} from './models/District';
import axiosInstance from './interceptor';
import { GetAllEmployeePaginationResponse } from './models/Employee';
import { CreateDocumentRequest, CreateDocumentResponse, GetAllDocumentPaginationResponse } from './models/Document';

export const getAllDistricts = async (token: string): Promise<GetAllDistrictsPaginationResponse> => {
  const response = await axiosInstance.get(`/district`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};
export const getAllDepartments = async (token: string): Promise<GetAllDepartmetsPaginationResponse> => {
  const response = await axiosInstance.get(`/department`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};
export const getAllOrganizations = async (token: string): Promise<GetAllOrgaizationsPaginationResponse> => {
  const response = await axiosInstance.get(`/organization`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getAllDistrictsPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
): Promise<GetAllDistrictsPaginationResponse> => {
  const response = await axiosInstance.get(`/district/dt`, {
    params: { start, length, sort_column: sortColumn },
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getAllDepartmentsPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
): Promise<GetAllDepartmetsPaginationResponse> => {
  const response = await axiosInstance.get(`/department/dt`, {
    params: { start, length, sort_column: sortColumn },
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getAllOrganizatiosPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
): Promise<GetAllOrgaizationsPaginationResponse> => {
  const response = await axiosInstance.get(`/organization/dt`, {
    params: { start, length, sort_column: sortColumn },
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getAllDocumentPagination = async(
  token: string,
  start: number,
  length: number,
  sortColumn: string,
): Promise<GetAllDocumentPaginationResponse> => {
  const response = await axiosInstance.get(`/document/dt`, {
    params: { start, length, sort_column: sortColumn },
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const updateDepartment = async (
  departmentId: string,
  data: UpdateDepartmentRequest,
  token: string,
): Promise<UpdateDepartmentResponse> => {
  try {
    const response = await axiosInstance.put(`/department/${departmentId}`, data, {
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

export const updateOrganization = async (
  organizationId: string,
  data: UpdateOrganizationRequest,
  token: string,
): Promise<UpdateOrganizationResponse> => {
  try {
    const response = await axiosInstance.put(`/organization/${organizationId}`, data, {
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

export const updateDistrict = async (
  districtId: string,
  data: UpdateDistrictRequest,
  token: string,
): Promise<UpdateDistrictResponse> => {
  try {
    const response = await axiosInstance.put(`/district/${districtId}`, data, {
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

export const deleteDistrict = async (
  districtId: string,
  token: string,
): Promise<DeleteDistrictResponse> => {
  const response = await axiosInstance.delete(`/district/${districtId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteDepartment = async (
  departmentId: string,
  token: string,
): Promise<DeleteDepartmentResponse> => {
  const response = await axiosInstance.delete(`/department/${departmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteOrganization = async (
  organizationId: string,
  token: string,
): Promise<DeleteOrganizationResponse> => {
  const response = await axiosInstance.delete(`/organization/${organizationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createDepartment = async (
  data: CreateDepartmentRequest,
  token: string,
): Promise<CreateDepartmentResponse> => {
  try {
    const response = await axiosInstance.post(`/department`, data, {
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

export const createDistrict = async (
  data: CreateDistrictRequest,
  token: string,
): Promise<CreateDistrictResponse> => {
  try {
    const response = await axiosInstance.post(`/district`, data, {
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

export const createOrganization = async (
  data: CreateOrganizationRequest,
  token: string,
): Promise<CreateOrganizationResponse> => {
  try {
    const response = await axiosInstance.post(`/organization`, data, {
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

export const createDocument = async (
  data: CreateDocumentRequest,
  token: string,
): Promise<CreateDocumentResponse> => {
  try {
    const response = await axiosInstance.post(`/document`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
}

export const getAllEmployeePagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  gender?: number,
  joinStart?: string,
  joinEnd?: string,
  exitStart?: string,
  exitEnd?: string,
  statusEmployee?: number,
  isHead?: boolean,
  organization?: string,
  district?: string,
  department?: string,
): Promise<GetAllEmployeePaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    sort_column: sortColumn,
  };

  if (gender !== undefined) params.gender = gender;
  if (joinStart) params['join-start'] = joinStart;
  if (joinEnd) params['join-end'] = joinEnd;
  if (exitStart) params['exit-start'] = exitStart;
  if (exitEnd) params['exit-end'] = exitEnd;
  if (statusEmployee !== undefined) params['status-employee'] = statusEmployee;
  if (isHead !== undefined) params['is-head'] = isHead;
  if (organization) params.organization = organization;
  if (district !== undefined) params.district = district;
  if (department !== undefined) params.department = department;

  const response = await axiosInstance.get(`/employee/dt`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};
