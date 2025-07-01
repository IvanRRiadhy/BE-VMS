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
import { CreateEmployeeRequest, CreateEmployeeResponse, GetAllEmployeePaginationResponse, UpdateEmployeeRequest, UpdateEmployeeResponse } from './models/Employee';
import { CreateDocumentRequest, CreateDocumentResponse, GetAllDocumentPaginationResponse, UpdateDocumentRequest, UpdateDocumentResponse } from './models/Document';
import { CreateSiteRequest, CreateSiteResponse, GetAllSitesPaginationResponse, GetAllSitesResponse, UploadImageSiteResponse } from './models/Sites';
import { CreateSiteDocumentRequest, CreateSiteDocumentResponse } from './models/SiteDocument';
import { GetAllBrandPaginationResponse, GetAllBrandResponse } from './models/Brand';
import { CreateIntegrationRequest, CreateIntegrationResponse, DeleteIntegrationResponse, GetAllIntegrationResponse, GetAvailableIntegrationResponse } from './models/Integration';
import { CreateAccessControlRequest, CreateAccessControlResponse, GetAccessControlPaginationResponse, GetAllAccessControlResponse, UpdateAccessControlRequest, UpdateAccessControlResponse } from './models/AccessControl';

// District API
export const getAllDistricts = async (token: string): Promise<GetAllDistrictsPaginationResponse> => {
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
): Promise<GetAllDistrictsPaginationResponse> => {
  const response = await axiosInstance.get(`/district/dt`, {
    params: { start, length, sort_column: sortColumn },
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


// Department API
export const getAllDepartments = async (token: string): Promise<GetAllDepartmetsPaginationResponse> => {
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
): Promise<GetAllDepartmetsPaginationResponse> => {
  const response = await axiosInstance.get(`/department/dt`, {
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

// Organization API
export const getAllOrganizations = async (token: string): Promise<GetAllOrgaizationsPaginationResponse> => {
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
): Promise<GetAllOrgaizationsPaginationResponse> => {
  const response = await axiosInstance.get(`/organization/dt`, {
    params: { start, length, sort_column: sortColumn },
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


// Document API
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

// Employee API
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

//Site API
export const getAllSitePagination = async(
  token: string,
  start: number,
  length: number,
  sortColumn: string,
): Promise<GetAllSitesPaginationResponse> => {
  const response = await axiosInstance.get(`/site/dt`, {
    params: { start, length, sort_column: sortColumn },
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  console.log(response.data);
  return response.data;
}

export const getAllSite = async (
  token: string,
): Promise<GetAllSitesResponse> => {
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
}
// export const updateSite = async (
//   siteId: string,
//   data: UpdateSiteRequest,
//   token: string,
// ): Promise<UpdateSiteResponse> => (
//   axiosInstance.put(`/site/${siteId}`, data, {
//     headers: { Authorization: `Bearer ${token}` },
//   })
// )

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
    console.log("The Data: ", data);
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

//Brand API
export const getAllBrand = async (
  token: string,
): Promise<GetAllBrandResponse> => {
  try{
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
): Promise<GetAllBrandPaginationResponse> => {
  try {
    const response = await axiosInstance.get(`/brand/dt`, {
      params: { start, length, sort_column: sortColumn },
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

//Integration API
export const getAllIntegration = async (
  token: string,
): Promise<GetAllIntegrationResponse> => {
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

export const createIntegration = async(
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
}

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
}

//AccessControl API
export const getAllAccessControl = async (
  token: string,
): Promise<GetAllAccessControlResponse> => {
  try {
    const response = await axiosInstance.get(`/access-control`, {
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

export const getAllAccessControlPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
): Promise<GetAccessControlPaginationResponse> => {
  try {
    const response = await axiosInstance.get(`/access-control/dt`, {
      params: { start, length, sort_column: sortColumn },
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
}
