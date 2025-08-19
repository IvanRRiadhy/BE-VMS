//#region IMPORT
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
import {
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  GetAllEmployeePaginationResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
  DeleteEmployeeResponse,
  UploadImageEmployeeResponse,
} from './models/Employee';
import {
  CreateDocumentRequest,
  CreateDocumentResponse,
  GetAllDocumentPaginationResponse,
  UpdateDocumentRequest,
  UpdateDocumentResponse,
  GetAllDocumentResponse,
} from './models/Document';
import {
  CreateSiteRequest,
  CreateSiteResponse,
  GetAllSitesPaginationResponse,
  GetAllSitesResponse,
  UpdateSiteRequest,
  UpdateSiteResponse,
  UploadImageSiteResponse,
  UpdateSitestRequest,
  DeleteSiteResponse,
} from './models/Sites';
import {
  CreateSiteDocumentRequest,
  CreateSiteDocumentResponse,
  GetAllSiteDocumentResponse,
} from './models/SiteDocument';
import { GetAllBrandPaginationResponse, GetAllBrandResponse } from './models/Brand';
import {
  CreateIntegrationRequest,
  CreateIntegrationResponse,
  DeleteIntegrationResponse,
  GetAllIntegrationResponse,
  GetAvailableIntegrationResponse,
  GetIntegrationByIdResponse,
  UpdateIntegrationRequest,
  UpdateIntegrationResponse,
} from './models/Integration';
import {
  CreateAccessControlRequest,
  CreateAccessControlResponse,
  GetAccessControlPaginationResponse,
  GetAllAccessControlResponse,
  UpdateAccessControlRequest,
  UpdateAccessControlResponse,
} from './models/AccessControl';
import {
  CreateCustomFieldRequest,
  CreateCustomFieldResponse,
  GetAllCustomFieldPaginationResponse,
  GetAllCustomFieldResponse,
  UpdateCustomFieldRequest,
  UpdateCustomFieldResponse,
} from './models/CustomField';

import {
  GetAllVisitorTypePaginationResponse,
  CreateVisitorTypeResponse,
  CreateVisitorTypeRequest,
  DeleteVisitorTypeResponse,
  UpdateVisitorTypeResponse,
  GetVisitorTypeByIdResponse,
  UpdateVisitorTypeRequest,
} from './models/VisitorType';
import {
  GetAllVisitorPaginationResponse,
  CreateVisitorRequest,
  CreateVisitorResponse,
  DeleteVisitorResponse,
} from './models/Visitor';

import {
  CreateVisitorCardRequest,
  GetAllVisitorCardPaginationResponse,
  UpdateVisitorCardRequest,
  UpdateVisitorCardResponse,
} from './models/VisitorCard';

//#endregion

//#region Visitor Card
export const getAllVisitorCard = async (
  token: string,
): Promise<GetAllVisitorCardPaginationResponse> => {
  const response = await axiosInstance.get('/card', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getAllVisitorCardPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
): Promise<GetAllVisitorCardPaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    sort_column: sortColumn,
    'search[value]': keyword,
  };
  const response = await axiosInstance.get('/card/dt', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    params,
  });
  return response.data;
};

// create batch

export const createBatchVisitor = async (
  token: string,
  data: CreateVisitorCardRequest[],
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('card/create-batch', data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const createVisitorCard = async (
  token: string,
  data: CreateVisitorCardRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/card', data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const updateVisitorCard = async (
  token: string,
  id: string,
  data: UpdateVisitorCardRequest,
): Promise<UpdateVisitorCardResponse> => {
  const response = await axiosInstance.put(`/card/${id}`, data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const deleteVisitorCard = async (
  token: string,
  id: string,
): Promise<DeleteVisitorResponse> => {
  const response = await axiosInstance.delete(`/card/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

//#region Visitor
// Get  All
export const getAllVisitor = async (token: string): Promise<GetAllVisitorPaginationResponse> => {
  const response = await axiosInstance.get('/visitor', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

// Get By Id
export const getVisitorById = async (
  token: string,
  id: string,
): Promise<GetAllVisitorTypePaginationResponse> => {
  const response = await axiosInstance.get(`/visitor/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

// Pagination
export const getAllVisitorPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
): Promise<GetAllVisitorPaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    sort_column: sortColumn,
    'search[value]': keyword,
  };
  const response = await axiosInstance.get('/visitor', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    params,
  });
  return response.data;
};

// Create
export const createVisitor = async (
  token: string,
  data: CreateVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/visitor/new-visit', data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

// Update
export const updateVisitor = async (
  token: string,
  id: string,
  data: CreateVisitorRequest,
): Promise<UpdateVisitorTypeResponse> => {
  const response = await axiosInstance.put(`/visitor/${id}`, data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

// Delete
export const deleteVisitor = async (
  token: string,
  visitId: string,
): Promise<DeleteVisitorResponse> => {
  const response = await axiosInstance.delete(`/visitor/${visitId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

//end visitor

//#region Visitor Type

// Get All
export const getAllVisitorType = async (
  token: string,
): Promise<GetAllVisitorTypePaginationResponse> => {
  const response = await axiosInstance.get('/visitor-type', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

// Get by id visitor type
export const getVisitorTypeById = async (
  token: string,
  id: string,
): Promise<GetVisitorTypeByIdResponse> => {
  const response = await axiosInstance.get(`/visitor-type/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

// Get Visitor Type Paginaton
export const getAllVisitorTypePagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
  // gender?: number,
  // joinStart?: string,
  // joinEnd?: string,
  // exitStart?: string,
  // exitEnd?: string,
  // isHead?: boolean,
  // document?: string,
): Promise<GetAllVisitorTypePaginationResponse> => {
  // if (gender) params.gender = gender;
  // if (joinStart) params.join_start = joinStart;
  // if (joinEnd) params.join_end = joinEnd;
  // if (exitStart) params.exit_start = exitStart;
  // if (exitEnd) params.exit_end = exitEnd;
  // if (isHead) params.is_head = isHead;
  // if (document) params.document = document;

  const response = await axiosInstance.get(`/visitor-type/dt`, {
    params: {
      start,
      length,
      sort_column: sortColumn,
      'search[value]': keyword,
    },
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });

  return response.data;
};

// getall visitor typepagination

export const createVisitorType = async (
  token: string,
  data: CreateVisitorTypeRequest,
): Promise<CreateVisitorTypeResponse> => {
  const response = await axiosInstance.post(`/visitor-type`, data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const updateVisitorType = async (
  token: string,
  visitorId: string,
  data: UpdateVisitorTypeRequest,
): Promise<UpdateVisitorTypeResponse> => {
  console.log(data);
  const response = await axiosInstance.put(`/visitor-type/${visitorId}`, data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });

  return response.data;
};

export const deleteVisitorType = async (
  token: string,
  visitorId: string,
): Promise<DeleteVisitorTypeResponse> => {
  const response = await axiosInstance.delete(`/visitor-type/${visitorId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

//#region District API
export const getAllDistricts = async (
  token: string,
): Promise<GetAllDistrictsPaginationResponse> => {
  const response = await axiosInstance.get(`/district`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};
export const getAllDistrictsPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
): Promise<GetAllDistrictsPaginationResponse> => {
  const response = await axiosInstance.get(`/district/dt`, {
    params: {
      start,
      length,
      sort_column: sortColumn,
      'search[value]': keyword, // ← ini yang bikin search jalan
    },
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
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
//#endregion

//#region Department API
export const getAllDepartments = async (
  token: string,
): Promise<GetAllDepartmetsPaginationResponse> => {
  const response = await axiosInstance.get(`/department`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};
export const getAllDepartmentsPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
): Promise<GetAllDepartmetsPaginationResponse> => {
  const response = await axiosInstance.get(`/department/dt`, {
    params: { start, length, sort_column: sortColumn, 'search[value]': keyword },
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
export const deleteDepartment = async (
  departmentId: string,
  token: string,
): Promise<DeleteDepartmentResponse> => {
  const response = await axiosInstance.delete(`/department/${departmentId}`, {
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
//#endregion

//#region Organization API
export const getAllOrganizations = async (
  token: string,
): Promise<GetAllOrgaizationsPaginationResponse> => {
  const response = await axiosInstance.get(`/organization`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};
export const getAllOrganizatiosPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
): Promise<GetAllOrgaizationsPaginationResponse> => {
  const response = await axiosInstance.get(`/organization/dt`, {
    params: { start, length, sort_column: sortColumn, 'search[value]': keyword },
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
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
export const deleteOrganization = async (
  organizationId: string,
  token: string,
): Promise<DeleteOrganizationResponse> => {
  const response = await axiosInstance.delete(`/organization/${organizationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
//#endregion

//#region Document API

// Get aLL
export const getAllDocument = async (token: string): Promise<GetAllDocumentResponse> => {
  const response = await axiosInstance.get(`/document`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getAllDocumentPagination = async (
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
};
export const updateDocument = async (
  documentId: string,
  data: UpdateDocumentRequest,
  token: string,
): Promise<UpdateDocumentResponse> => {
  try {
    const response = await axiosInstance.put(`/document/${documentId}`, data, {
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
//#endregion

//#region Employee API

export const getAllEmployee = async (token: string): Promise<GetAllEmployeePaginationResponse> => {
  const response = await axiosInstance.get(`/employee`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getEmployeeById = async (
  id: string,
  token: string,
): Promise<GetAllEmployeePaginationResponse> => {
  const response = await axiosInstance.get(`/employee/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getAllEmployeePagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
): Promise<GetAllEmployeePaginationResponse> => {
  // const params: Record<string, any> = {
  //   start,
  //   length,
  //   sort_column: sortColumn,
  //   'search[value]': keyword, // ← ini memang harus pakai tanda kurung
  // };

  const response = await axiosInstance.get(`/employee/dt`, {
    params: { start, length, sort_column: sortColumn, 'search[value]': keyword },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  console.log('response.data:', response.data);

  return response.data;
};

export const getAllEmployeePaginationFilterMore = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
  // gender?: number,
  // joinStart?: string,
  // joinEnd?: string,
  // exitStart?: string,
  // exitEnd?: string,
  // statusEmployee?: number,
  // isHead?: boolean,
  organization?: string,
  district?: string,
  department?: string,
): Promise<GetAllEmployeePaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    sort_column: sortColumn,
    'search[value]': keyword, // ← ini diperbaiki!
    organization,
    district,
    department,
  };

  // if (gender !== undefined) params.gender = gender;
  // if (joinStart) params['join-start'] = joinStart;
  // if (joinEnd) params['join-end'] = joinEnd;
  // if (exitStart) params['exit-start'] = exitStart;
  // if (exitEnd) params['exit-end'] = exitEnd;
  // if (statusEmployee !== undefined) params['status-employee'] = statusEmployee;
  // if (isHead !== undefined) params['is-head'] = isHead;
  if (organization && organization !== '0') params.organization = organization;
  if (district && district !== '0') params.district = district;
  if (department && department !== '0') params.department = department;

  const response = await axiosInstance.get(`/employee/dt`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const createEmployee = async (
  data: CreateEmployeeRequest,
  token: string,
): Promise<CreateEmployeeResponse> => {
  try {
    console.log(data);
    const response = await axiosInstance.post(`/employee`, data, {
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

export const updateEmployee = async (
  employeeId: string,
  data: UpdateEmployeeRequest,
  token: string,
): Promise<UpdateEmployeeResponse> => {
  try {
    const response = await axiosInstance.put(`/employee/${employeeId}`, data, {
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

export const deleteEmployee = async (
  employeeId: string,
  token: string,
): Promise<DeleteEmployeeResponse> => {
  const response = await axiosInstance.delete(`/employee/${employeeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const uploadImageEmployee = async (
  employeeId: string,
  data: File,
  token: string,
): Promise<UploadImageEmployeeResponse> => {
  try {
    const formData = new FormData();
    formData.append('faceimage', data);
    const response = await axiosInstance.post(`/employee/upload/${employeeId}`, formData, {
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

//#region Site API
export const getAllSitePagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
): Promise<GetAllSitesPaginationResponse> => {
  const response = await axiosInstance.get(`/site/dt`, {
    params: { start, length, sort_column: sortColumn, 'search[value]': keyword },
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  // console.log(response.data);
  return response.data;
};

export const getAllSite = async (token: string): Promise<GetAllSitesResponse> => {
  const response = await axiosInstance.get(`/site`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const createSite = async (
  data: CreateSiteRequest,
  token: string,
): Promise<CreateSiteResponse> => {
  try {
    const response = await axiosInstance.post(`/site`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};
export const updateSite = async (
  siteId: string,
  data: UpdateSiteRequest,
  token: string,
): Promise<UpdateSiteResponse> => {
  try {
    const response = await axiosInstance.put(`/site/${siteId}`, data, {
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

export const deleteSiteSpace = async (
  siteId: string,
  token: string,
): Promise<DeleteSiteResponse> => {
  const response = await axiosInstance.delete(`/site/${siteId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const uploadImageSite = async (
  siteId: string,
  data: File,
  token: string,
): Promise<UploadImageSiteResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', data);
    const response = await axiosInstance.post(`/site/upload/${siteId}`, formData, {
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

export const getAllSiteDocument = async (token: string): Promise<GetAllSiteDocumentResponse> => {
  try {
    const response = await axiosInstance.get(`/site-document`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const createSiteDocument = async (
  data: CreateSiteDocumentRequest,
  token: string,
): Promise<CreateSiteDocumentResponse> => {
  try {
    const response = await axiosInstance.post(`/site-document`, data, {
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
//#endregion

//#region Brand API
export const getAllBrand = async (token: string): Promise<GetAllBrandResponse> => {
  try {
    const response = await axiosInstance.get(`/brand`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};
export const getAllBrandPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
): Promise<GetAllBrandPaginationResponse> => {
  try {
    const response = await axiosInstance.get(`/brand/dt`, {
      params: { start, length, sort_column: sortColumn, 'search[value]': keyword },
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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

//#region Integration API
export const getAllIntegration = async (token: string): Promise<GetAllIntegrationResponse> => {
  try {
    const response = await axiosInstance.get(`/integration`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const getAvailableIntegration = async (
  token: string,
): Promise<GetAvailableIntegrationResponse> => {
  try {
    const response = await axiosInstance.get(`/integration/available`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const getIntegrationById = async (
  id: string,
  token: string,
): Promise<GetIntegrationByIdResponse> => {
  try {
    const response = await axiosInstance.get(`/integration/${id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const createIntegration = async (
  data: CreateIntegrationRequest,
  token: string,
): Promise<CreateIntegrationResponse> => {
  try {
    const response = await axiosInstance.post(`/integration`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      console.log('Error creating integration:', error);
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

// sync data
export const syncIntegration = async (
  integrationId: string,
  data: CreateIntegrationRequest,
  token: string,
): Promise<void> => {
  try {
    const response = await axiosInstance.post(
      `/integration-honeywell/sync/${integrationId}`,
      null,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const deleteIntegration = async (
  integrationId: string,
  token: string,
): Promise<DeleteIntegrationResponse> => {
  console.log('Deleting integration with ID:', integrationId);
  console.log('Using token:', token);
  try {
    const response = await axiosInstance.delete(`/integration/${integrationId}`, {
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

export const updateIntegration = async (
  integrationId: string,
  data: UpdateIntegrationRequest,
  token: string,
): Promise<UpdateIntegrationResponse> => {
  try {
    const response = await axiosInstance.put(`/integration/${integrationId}`, data, {
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

//#endregion

//#region AccessControl API
export const getAllAccessControl = async (token: string): Promise<GetAllAccessControlResponse> => {
  try {
    const response = await axiosInstance.get(`/access-control`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data as GetAllAccessControlResponse;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const getAllAccessControlPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword?: string,
): Promise<GetAccessControlPaginationResponse> => {
  try {
    const response = await axiosInstance.get(`/access-control/dt`, {
      params: { start, length, sort_column: sortColumn, 'search[value]': keyword },
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const createAccessControl = async (
  data: CreateAccessControlRequest,
  token: string,
): Promise<CreateAccessControlResponse> => {
  try {
    const response = await axiosInstance.post(`/access-control`, data, {
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

export const deleteAccessControl = async (
  accessControlId: string,
  token: string,
): Promise<DeleteIntegrationResponse> => {
  try {
    const response = await axiosInstance.delete(`/access-control/${accessControlId}`, {
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

export const updateAccessControl = async (
  accessControlId: string,
  data: UpdateAccessControlRequest,
  token: string,
): Promise<UpdateAccessControlResponse> => {
  try {
    const response = await axiosInstance.put(`/access-control/${accessControlId}`, data, {
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
//#endregion

//#region Custom Field API
export const getAllCustomField = async (token: string): Promise<GetAllCustomFieldResponse> => {
  try {
    const response = await axiosInstance.get(`/custom-field`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const getAllCustomFieldPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword?: string,
): Promise<GetAllCustomFieldPaginationResponse> => {
  try {
    const response = await axiosInstance.get(`/custom-field/dt`, {
      params: { start, length, sort_column: sortColumn, 'search[value]': keyword },
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const createCustomField = async (
  data: CreateCustomFieldRequest,
  token: string,
): Promise<CreateCustomFieldResponse> => {
  try {
    const response = await axiosInstance.post(`/custom-field`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const updateCustomField = async (
  token: string,
  data: UpdateCustomFieldRequest,
  customFieldId: string,
): Promise<UpdateCustomFieldResponse> => {
  try {
    const response = await axiosInstance.put(`/custom-field/${customFieldId}`, data, {
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

export const deleteCustomField = async (
  customFieldId: string,
  token: string,
): Promise<DeleteVisitorTypeResponse> => {
  const response = await axiosInstance.delete(`/custom-field/${customFieldId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

// Visitor Type

//#endregion
