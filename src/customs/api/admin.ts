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
  GetAllOrganizationById,
  GetAllOrganizationPaginationResponse,
  GetAllOrganizationResponse,
  UpdateOrganizationRequest,
  UpdateOrganizationResponse,
} from './models/Organization';
import {
  CreateDistrictRequest,
  CreateDistrictResponse,
  DeleteDistrictResponse,
  GetAllDistrictsPaginationResponse,
  GetDistrictByIdResponse,
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
  GetAllEmployeeResponse,
  GetAllEmployeeByIdResponse,
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
  DeleteSiteResponse,
  GetSiteByIdResponse,
  CreateSiteParkingRequest,
  CreateSiteTrackingRequest,
  UpdateSiteTrackingRequest,
  UpdateSiteTrackingResponse,
  UpdateSiteParkingRequest,
  UpdateSiteParkingResponse,
} from './models/Sites';
import {
  CreateSiteDocumentRequest,
  CreateSiteDocumentResponse,
  GetAllSiteDocumentResponse,
} from './models/SiteDocument';
import {
  GetAllBrandPaginationResponse,
  GetAllBrandResponse,
  UpdateBrandResponse,
} from './models/Brand';
import {
  CreateIntegrationRequest,
  CreateIntegrationResponse,
  DeleteIntegrationResponse,
  GetAccessControlTrackingResponse,
  GetAccessControlTrackingResponseById,
  GetAlarmTrackingResponse,
  GetAlarmTrackingResponseById,
  GetAlarmWarningTrackingResponse,
  GetAlarmWarningTrackingResponseById,
  GetAllIntegrationResponse,
  GetAvailableIntegrationResponse,
  GetBadgeStatusResponse,
  GetBadgeStatusResponseById,
  GetBadgeTypeResponse,
  GetBadgeTypeResponseById,
  GetBleReaderTrackingResponse,
  GetBleReaderTrackingResponseById,
  GetBrandTrackingResponse,
  GetBrandTrackingResponseById,
  GetBuildingTrackingResponse,
  GetBuildingTrackingResponseById,
  GetCardTrackingResponse,
  GetCardTrackingResponseById,
  GetCctvTrackingResponse,
  GetCctvTrackingResponseById,
  GetClearCodesResponse,
  GetClearCodesResponseById,
  GetCompaniesResponse,
  GetCompaniesResponseById,
  GetDepartmentTrackingResponse,
  GetDepartmentTrackingResponseById,
  GetDistrictTrackingResponse,
  GetDistrictTrackingResponseById,
  GetFloorPlanMaskedAreaTrackingResponse,
  GetFloorPlanMaskedAreaTrackingResponseById,
  GetFloorPlanTrackingResponse,
  GetFloorPlanTrackingResponseById,
  GetFloorTrackingResponse,
  GetFloorTrackingResponseById,
  GetIntegrationByIdResponse,
  GetMemberTrackingResponse,
  GetMemberTrackingResponseById,
  GetOrganizationTrackingResponse,
  GetOrganizationTrackingResponseById,
  GetTrackingTransactionResponse,
  GetTrackingTransactionResponseById,
  GetTrxVisitorTrackingResponse,
  GetTrxVisitorTrackingResponseById,
  GetVisitorBlacklistAreaTrackingResponse,
  GetVisitorBlacklistAreaTrackingResponseById,
  GetVisitorTrackingResponse,
  GetVisitorTrackingResponseById,
  UpdateAccessControlTrackingRequest,
  UpdateAccessControlTrackingResponse,
  UpdateAlarmTrackingRequest,
  UpdateAlarmTrackingResponse,
  UpdateAlarmWarningTrackingResponse,
  UpdateBadgeTypeRequest,
  UpdateBadgeTypeResponse,
  UpdateBrandTrackingRequest,
  UpdateBrandTrackingResponse,
  UpdateBuildingTrackingRequest,
  UpdateBuildingTrackingResponse,
  UpdateCardTrackingRequest,
  UpdateCardTrackingResponse,
  UpdateCctvTrackingRequest,
  UpdateCctvTrackingResponse,
  UpdateClearcodesRequest,
  UpdateClearcodesResponse,
  UpdateCompaniesRequest,
  UpdateCompaniesResponse,
  UpdateDepartmentTrackingRequest,
  UpdateDepartmentTrackingResponse,
  UpdateDistrictTrackingRequest,
  UpdateDistrictTrackingResponse,
  UpdateFloorPlanMaskedAreaTrackingRequest,
  UpdateFloorPlanMaskedAreaTrackingResponse,
  UpdateFloorPlanTrackingRequest,
  UpdateFloorPlanTrackingResponse,
  UpdateFloorTrackingRequest,
  UpdateFloorTrackingResponse,
  UpdateIntegrationRequest,
  UpdateIntegrationResponse,
  UpdateMemberTrackingRequest,
  UpdateMemberTrackingResponse,
  UpdateOrganizationTrackingRequest,
  UpdateOrganizationTrackingResponse,
  UpdateTrxVisitorTrackingRequest,
  UpdateTrxVisitorTrackingResponse,
  UpdateVisitorBlacklistAreaTrackingRequest,
  UpdateVisitorBlacklistAreaTrackingResponse,
  UpdateVisitorTrackingRequest,
  UpdateVisitorTrackingResponse,
} from './models/Integration';
import {
  CreateAccessControlRequest,
  CreateAccessControlResponse,
  GetAccessControlByIdResponse,
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
  GetAllVisitorTypeResponse,
} from './models/VisitorType';
import {
  GetAllVisitorPaginationResponse,
  CreateVisitorRequest,
  CreateVisitorResponse,
  DeleteVisitorResponse,
  CreateGroupVisitorRequest,
} from './models/Visitor';

import {
  CreateVisitorCardRequest,
  GetAllVisitorCardPaginationResponse,
  GetAllVisitorCardResponse,
  GetAvailableCardResponse,
  GetGetVisitorCardByIdResponse,
  UpdateVisitorCardRequest,
  UpdateVisitorCardResponse,
} from './models/VisitorCard';
import {
  CreateEmailRequest,
  CreateEmailResponse,
  CreateSettingSmtpRequest,
  CreateSettingSmtpResponse,
  GetAllSettingSmtpPaginationResponse,
  GetAllSettingSmtpResponse,
  UpdateSettingSmtpRequest,
  UpdateSettingSmtpResponse,
} from './models/SettingSmtp';
import {
  CreateTimezoneRequest,
  CreateTimezoneResponse,
  DeleteTimezoneResponse,
  GetAllTimezonePaginationResponse,
  GetAllTimezoneResponse,
  GetTimezoneByIdResponse,
  UpdateTimezoneRequest,
  UpdateTimezoneResponse,
} from './models/Timezone';
import {
  CreateCheckGiveAccessRequest,
  CreateCheckGiveAccessResponse,
  GetAllGrantAccessResponse,
} from './models/GrantAccess';
import { GetAllSettingResponse } from './models/Setting';

//#endregion

// #region Setting

export const getSetting = async (token: string): Promise<GetAllSettingResponse> => {
  const response = await axiosInstance.get('/setting/visitor', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const updateSetting = async (token: string, id: string, data: any): Promise<any> => {
  const response = await axiosInstance.put(`/setting/visitor/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

//

// #region Dashboard

export const getAccessPass = async (
  token: string,
): Promise<any> => {
  const response = await axiosInstance.get('/dashboard/access-pass', {
    headers: { Authorization: `Bearer ${token}` },
    // params: { 'start-date': start_date, 'end-date': end_date },
  });
  console.log("response", response);
  return response.data.collection[0];
};


export const getTopVisitingPurpose = async (
  token: string,
  start_date: string,
  end_date: string,
): Promise<any> => {
  const params = {
    'start-date': start_date,
    'end-date': end_date,
  };
  const response = await axiosInstance.get('/dashboard/top-visiting-purpose', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const getTopVisitors = async (
  token: string,
  start_date: string,
  end_date: string,
): Promise<any> => {
  const params = {
    'start-date': start_date,
    'end-date': end_date,
  };
  const response = await axiosInstance.get('/dashboard/top-visitors', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const getAvarageDuration = async (
  token: string,
  start_date: string,
  end_date: string,
): Promise<any> => {
  const params = {
    'start-date': start_date,
    'end-date': end_date,
  };
  const response = await axiosInstance.get('/dashboard/average-duration', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const getRepeatsVisitor = async (
  token: string,
  start_date: string,
  end_date: string,
): Promise<any> => {
  const params = {
    'start-date': start_date,
    'end-date': end_date,
  };
  const response = await axiosInstance.get('/dashboard/repeats-visitor', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const getVisitorChart = async (
  token: string,
  start_date: string,
  end_date: string,
): Promise<any> => {
  const params = {
    'start-date': start_date,
    'end-date': end_date,
  };
  const response = await axiosInstance.get('/dashboard/visitor-chart', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const getHeatmaps = async (
  token: string,
  start_date: string,
  end_date: string,
): Promise<any> => {
  const params = {
    'start-date': start_date,
    'end-date': end_date,
  };
  const response = await axiosInstance.get('/dashboard/heatmaps', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const getTodayVisitorCount = async (
  token: string,
  start_date: string,
  end_date: string,
): Promise<any> => {
  const response = await axiosInstance.get('/dashboard/today-visitor-count', {
    headers: { Authorization: `Bearer ${token}` },
    params: { 'start-date': start_date, 'end-date': end_date },
  });
  return response.data;
};

export const getTodayPraregister = async (
  token: string,
  start_date: string,
  end_date: string,
): Promise<any> => {
  const response = await axiosInstance.get('/dashboard/today-praregister', {
    headers: { Authorization: `Bearer ${token}` },
    params: { 'start-date': start_date, 'end-date': end_date },
  });
  return response.data;
};

// #region Grant Access
export const getGrantAccess = async (
  token: string,
  site: string,
): Promise<GetAllGrantAccessResponse> => {
  const params = {
    site,
  };
  const response = await axiosInstance.get('/visitor/grant-access-card', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    params,
  });
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data;
};

export const createCheckGiveAccess = async (
  token: string,
  payload: { data_access: any[] },
): Promise<CreateCheckGiveAccessResponse> => {
  const response = await axiosInstance.post('/visitor/checkin-give-access', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// visitor/checkin-give-access

//#region Timezone

export const getAllTimezone = async (token: string): Promise<GetAllTimezoneResponse> => {
  const response = await axiosInstance.get('/time-access', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getAllTimezonePagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
): Promise<GetAllTimezonePaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    sort_column: sortColumn,
    'search[value]': keyword,
  };
  const response = await axiosInstance.get('/time-access/dt', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    params,
  });
  return response.data;
};

export const getTimezoneById = async (
  token: string,
  id: string,
): Promise<GetTimezoneByIdResponse> => {
  const response = await axiosInstance.get(`/time-access/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const createTimezone = async (
  token: string,
  data: CreateTimezoneRequest,
): Promise<CreateTimezoneResponse> => {
  const response = await axiosInstance.post('/time-access', data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const updateTimezone = async (
  token: string,
  id: string,
  data: UpdateTimezoneRequest,
): Promise<UpdateTimezoneResponse> => {
  const response = await axiosInstance.put(`/time-access/${id}`, data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const deleteTimezone = async (
  token: string,
  id: string,
): Promise<DeleteTimezoneResponse> => {
  const response = await axiosInstance.delete(`/time-access/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

//#endregion

//#region Card
export const getAllVisitorCard = async (token: string): Promise<GetAllVisitorCardResponse> => {
  const response = await axiosInstance.get('/card', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getVisitorCardById = async (
  token: string,
  id: string,
): Promise<GetGetVisitorCardByIdResponse> => {
  const response = await axiosInstance.get(`/card/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getAvailableCard = async (
  token: string,
  registered_site: string,
): Promise<GetAvailableCardResponse> => {
  const params = {
    'registered-site': registered_site,
  };

  const response = await axiosInstance.get('/card/available-cards', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    params,
  });
  return response.data;
};

export const getAllVisitorCardPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
  type?: number | null,
  cardStatus?: number, // ← ubah nama jadi camelCase
): Promise<GetAllVisitorCardPaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    sort_column: sortColumn,
    'search[value]': keyword,
  };

  if (type !== undefined && type !== null) {
    params.type = type;
  }

  if (cardStatus !== undefined && cardStatus !== null) {
    params['card-status'] = cardStatus; // API tetap butuh format snake-case / kebab-case
  }

  const response = await axiosInstance.get('/card/dt', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
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
import { format } from 'date-fns';
// Pagination
export const getAllVisitorPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword: string = '',
  start_date: string,
  end_date: string,
): Promise<GetAllVisitorPaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    sort_column: sortColumn,
    'search[value]': keyword,
    'start-date': start_date ? format(new Date(start_date), 'yyyy-MM-dd') : '',
    'end-date': end_date ? format(new Date(end_date), 'yyyy-MM-dd') : '',
  };
  const response = await axiosInstance.get('/visitor/dt', {
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

export const createVisitors = async (
  token: string,
  data: CreateGroupVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/visitor/new-visit', data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};


// Pra Register
export const createPraRegister = async (
  token: string,
  data: CreateVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/visitor/new-pra-invite', data, {
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
export const getAllVisitorType = async (token: string): Promise<GetAllVisitorTypeResponse> => {
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
  sortDir?: string,
  keyword: string = '',
): Promise<GetAllDistrictsPaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    sort_column: sortColumn,
    'search[value]': keyword, // tetap ada untuk search
  };

  if (sortDir) {
    params.sort_dir = sortDir;
  }

  const response = await axiosInstance.get(`/district/dt`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  return response.data;
};
// get by id district
export const getDistrictById = async (
  id: string,
  token: string,
): Promise<GetDistrictByIdResponse> => {
  const response = await axiosInstance.get(`/district/${id}`, {
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
  sortDir?: string,
  keyword: string = '',
): Promise<GetAllDepartmetsPaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    sort_column: sortColumn,
    'search[value]': keyword,
  };

  if (sortDir) {
    params.sort_dir = sortDir;
  }

  const response = await axiosInstance.get(`/department/dt`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  return response.data;
};
// get by id department

export const getDepartmentById = async (id: string, token: string) => {
  const response = await axiosInstance.get(`/department/${id}`, {
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
export const getAllOrganizations = async (token: string): Promise<GetAllOrganizationResponse> => {
  const response = await axiosInstance.get(`/organization`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};
export const getAllOrganizationPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  sortDir?: string,
  keyword: string = '',
): Promise<GetAllOrganizationPaginationResponse> => {
  // bikin object params dulu
  const params: Record<string, any> = {
    start,
    length,
    sort_column: sortColumn,
    'search[value]': keyword,
  };

  // tambahkan sortDir hanya kalau ada
  if (sortDir) {
    params.sort_dir = sortDir;
  }

  const response = await axiosInstance.get(`/organization/dt`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  return response.data;
};

// get by id organization
export const getOrganizationById = async (
  id: string,
  token: string,
): Promise<GetAllOrganizationById> => {
  const response = await axiosInstance.get(`/organization/${id}`, {
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
  keyword?: string,
): Promise<GetAllDocumentPaginationResponse> => {
  try {
    const response = await axiosInstance.get(`/document/dt`, {
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

export const deleteDocument = async (
  documentId: string,
  token: string,
): Promise<DeleteOrganizationResponse> => {
  const response = await axiosInstance.delete(`/document/${documentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
//#endregion

//#region Employee API

export const getAllEmployee = async (token: string): Promise<GetAllEmployeeResponse> => {
  const response = await axiosInstance.get(`/employee`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getAllEmployees = async (): Promise<GetAllEmployeeResponse> => {
  const response = await axiosInstance.get(`/employee`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getEmployeeById = async (
  id: string,
  token: string,
): Promise<GetAllEmployeeByIdResponse> => {
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
  gender?: number,
  joinStart?: string,
  // joinEnd?: string,
  // exitStart?: string,
  exitEnd?: string,
  statusEmployee?: number,
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
    'join-start': joinStart,
    'exit-end': exitEnd,
    'status-employee': statusEmployee,
    organization,
    district,
    department,
  };

  if (gender !== undefined) params.gender = gender;
  // if (joinStart) params['join-start'] = joinStart;
  // if (joinEnd) params['join-end'] = joinEnd;
  // if (exitStart) params['exit-start'] = exitStart;
  // if (exitEnd) params['exit-end'] = exitEnd;
  if (statusEmployee !== undefined) params['status-employee'] = statusEmployee;
  // if (isHead !== undefined) params['is-head'] = isHead;
  if (organization && organization !== '0') params.organization = organization;
  if (district && district !== '0') params.district = district;
  if (department && department !== '0') params.department = department;
  if (joinStart) params.join_start = joinStart;
  if (exitEnd) params.exit_end = exitEnd;

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
  type?: number,
): Promise<GetAllSitesPaginationResponse> => {
  const response = await axiosInstance.get(`/site/dt`, {
    params: {
      start,
      length,
      sort_column: sortColumn,
      'search[value]': keyword,
      ...(type !== undefined ? { type } : {}),
    },
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

export const getRegisteredSite = async (token: string): Promise<GetAllSitesResponse> => {
  const response = await axiosInstance.get(`/site/registered-point`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getSiteById = async (id: string, token: string): Promise<GetSiteByIdResponse> => {
  const response = await axiosInstance.get(`/site/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};
export const getSitesParking = async (token: string): Promise<any> => {
  const response = await axiosInstance.get(`/site-parking`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getSitesTracking = async (token: string): Promise<any> => {
  const response = await axiosInstance.get(`/site-tracking`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getSiteParking = async (token: string): Promise<any> => {
  const response = await axiosInstance.get(`/integration-parking/area`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getSiteTracking = async (token: string): Promise<any> => {
  const response = await axiosInstance.get(`/integration-trackingble/floorplan-masked-area`, {
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

export const getSiteParkingById = async (id: string, token: string): Promise<any> => {
  const response = await axiosInstance.get(`/site-parking/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const createSiteParking = async (
  data: CreateSiteParkingRequest,
  token: string,
): Promise<CreateSiteResponse> => {
  try {
    const response = await axiosInstance.post(`/site-parking`, data, {
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

export const createSiteTracking = async (
  data: CreateSiteTrackingRequest,
  token: string,
): Promise<CreateSiteResponse> => {
  try {
    const response = await axiosInstance.post(`/site-tracking`, data, {
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

export const updateSiteTracking = async (
  id: string,
  data: UpdateSiteTrackingRequest,
  token: string,
): Promise<UpdateSiteTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/site-tracking/${id}`, data, {
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

export const updateSiteParking = async (
  id: string,
  data: UpdateSiteParkingRequest,
  token: string,
): Promise<UpdateSiteParkingResponse> => {
  try {
    const response = await axiosInstance.put(`/site-parking/${id}`, data, {
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

//#region Site Document
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

export const deleteBrand = async (brandId: string, token: string): Promise<UpdateBrandResponse> => {
  try {
    const response = await axiosInstance.delete(`/brand/${brandId}`, {
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

export const getAccessControlsById = async (
  id: string,
  token: string,
): Promise<GetAccessControlByIdResponse> => {
  try {
    const response = await axiosInstance.get(`/access-control/${id}`, {
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

//#endregion

//#region Setting Smtp

export const getAllSmtp = async (token: string): Promise<GetAllSettingSmtpResponse> => {
  try {
    const response = await axiosInstance.get(`/setting-smtp`, {
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

export const getAllPaginationSettingSmtp = async (
  token: string,
  start: number,
  length: number,
  sortColumn: string,
  keyword?: string,
): Promise<GetAllSettingSmtpPaginationResponse> => {
  try {
    const response = await axiosInstance.get(`/setting-smtp/dt`, {
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

export const createSmtp = async (
  data: CreateSettingSmtpRequest,
  token: string,
): Promise<CreateSettingSmtpResponse> => {
  try {
    const response = await axiosInstance.post(`/setting-smtp`, data, {
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

export const updateSmtp = async (
  token: string,
  data: UpdateSettingSmtpRequest,
  smtpId: string,
): Promise<UpdateSettingSmtpResponse> => {
  try {
    const response = await axiosInstance.put(`/setting-smtp/${smtpId}`, data, {
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

export const deleteSmtp = async (
  smtpId: string,
  token: string,
): Promise<DeleteVisitorTypeResponse> => {
  const response = await axiosInstance.delete(`/setting-smtp/${smtpId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const createEmail = async (
  data: CreateEmailRequest,
  token: string,
): Promise<CreateEmailResponse> => {
  try {
    const response = await axiosInstance.post(`/email/test-email`, data, {
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
type ApiResponse = {
  status: 'success' | 'fail' | 'not_found' | string;
  status_code: number;
  title?: string;
  msg?: string;
  collection?: any;
};

export const syncHoneywellIntegration = async (
  integrationId: string,
  token: string,
): Promise<ApiResponse> => {
  try {
    const { data } = await axiosInstance.post(
      `/integration-honeywell/sync/${integrationId}`,
      {}, // pakai {} biar nggak trigger edge-case body null
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data as ApiResponse;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const d = (error.response.data || {}) as Partial<ApiResponse>;
      // Normalisasi agar caller selalu dapat objek seragam
      return {
        status: d.status ?? 'fail',
        status_code: d.status_code ?? error.response.status,
        title: d.title ?? 'fail',
        msg: d.msg ?? 'Request failed',
        collection: d.collection ?? null,
      };
    }
    // jaringan / non-HTTP error — biarkan meledak supaya ketahuan
    throw error;
  }
};

export const syncTrackingBleIntegration = async (
  integrationId: string,
  token: string,
): Promise<ApiResponse> => {
  try {
    const { data } = await axiosInstance.post(
      `/integration-trackingble/sync/${integrationId}`,
      {}, // pakai {} biar nggak trigger edge-case body null
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data as ApiResponse;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const d = (error.response.data || {}) as Partial<ApiResponse>;
      // Normalisasi agar caller selalu dapat objek seragam
      return {
        status: d.status ?? 'fail',
        status_code: d.status_code ?? error.response.status,
        title: d.title ?? 'fail',
        msg: d.msg ?? 'Request failed',
        collection: d.collection ?? null,
      };
    }
    // jaringan / non-HTTP error — biarkan meledak supaya ketahuan
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

//#region Honeywell
// get companies
export const getCompanies = async (
  integrationId: string,
  token: string,
): Promise<GetCompaniesResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-honeywell/company/${integrationId}`, {
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

// get companies by id
export const getCompaniesById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetCompaniesResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-honeywell/company/${integrationId}/${id}`,
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

export const updateCompany = async (
  id: string,
  data: UpdateCompaniesRequest,
  token: string,
): Promise<UpdateCompaniesResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-honeywell/company/${id}`, data, {
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

// get badge type
export const getBadgeType = async (
  integrationId: string,
  token: string,
): Promise<GetBadgeTypeResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-honeywell/badge-type/${integrationId}`, {
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

// get badge type by id
export const getBadgeTypeById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetBadgeTypeResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-honeywell/badge-type/${integrationId}/${id}`,
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

export const updateBadgeType = async (
  id: string,
  data: UpdateBadgeTypeRequest,
  token: string,
): Promise<UpdateBadgeTypeResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-honeywell/badge-type/${id}`, data, {
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

// get badge status
export const getBadgeStatus = async (
  integrationId: string,
  token: string,
): Promise<GetBadgeStatusResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-honeywell/badge-status/${integrationId}`,
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

//  get badge status by id
export const getBadgeStatusById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetBadgeStatusResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-honeywell/badge-status/${integrationId}/${id}`,
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

// get clearcodes
export const getClearcodes = async (
  integrationId: string,
  token: string,
): Promise<GetClearCodesResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-honeywell/clearcodes/${integrationId}`, {
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

// get clearcodes by id
export const getClearcodesById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetClearCodesResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-honeywell/clearcodes/${integrationId}/${id}`,
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

export const updateClearcodes = async (
  id: string,
  data: UpdateClearcodesRequest,
  token: string,
): Promise<UpdateClearcodesResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-honeywell/clearcodes/${id}`, data, {
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

//#region Tracking Ble

export const getOrganizationTracking = async (
  integrationId: string,
  token: string,
): Promise<GetOrganizationTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/organization/${integrationId}`,
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

export const getOrganizationTrackingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetOrganizationTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/organization/${integrationId}/${id}`,
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

export const updateOrganizationTracking = async (
  id: string,
  data: UpdateOrganizationTrackingRequest,
  token: string,
): Promise<UpdateOrganizationTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/organization/${id}`, data, {
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

// Department
export const getDepartmentTracking = async (
  integrationId: string,
  token: string,
): Promise<GetDepartmentTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/department/${integrationId}`,
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

export const getDepartmentTrackingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetDepartmentTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/department/${integrationId}/${id}`,
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

export const updateDepartmentTracking = async (
  id: string,
  data: UpdateDepartmentTrackingRequest,
  token: string,
): Promise<UpdateDepartmentTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/department/${id}`, data, {
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

// District
export const getDistrictTracking = async (
  integrationId: string,
  token: string,
): Promise<GetDistrictTrackingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-trackingble/district/${integrationId}`, {
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

export const getDistrictTrackingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetDistrictTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/district/${integrationId}/${id}`,
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

export const updateDistrictTracking = async (
  id: string,
  data: UpdateDistrictTrackingRequest,
  token: string,
): Promise<UpdateDistrictTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/district/${id}`, data, {
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

// Card
export const getCardTracking = async (
  integrationId: string,
  token: string,
): Promise<GetCardTrackingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-trackingble/card/${integrationId}`, {
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

export const getCardTrackingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetCardTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/card/${integrationId}/${id}`,
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

export const updateCardTracking = async (
  id: string,
  data: UpdateCardTrackingRequest,
  token: string,
): Promise<UpdateCardTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/card/${id}`, data, {
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

//#region Alarm Record

export const getAlarmTracking = async (
  integrationId: string,
  token: string,
): Promise<GetAlarmTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/alarm-record-tracking/${integrationId}`,
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

export const getAlarmTrackingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetAlarmTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/alarm-record-tracking/${integrationId}/${id}`,
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

export const updateAlarmTracking = async (
  id: string,
  data: UpdateAlarmTrackingRequest,
  token: string,
): Promise<UpdateAlarmTrackingResponse> => {
  try {
    const response = await axiosInstance.put(
      `/integration-trackingble/alarm-record-tracking/${id}`,
      data,
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

// Alarm Warning

export const getAlarmWarningTracking = async (
  integrationId: string,
  token: string,
): Promise<GetAlarmWarningTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/alarm-warning/${integrationId}`,
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

export const getAlarmWarningTrackingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetAlarmWarningTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/alarm-warning/${integrationId}/${id}`,
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

// export const updateAlarmWarningTracking = async (
//   id: string,
//   data: UpdateAlarmWarningTrackingRequest,
//   token: string,
// ): Promise<UpdateAlarmWarningTrackingResponse> => {
//   try {
//     const response = await axiosInstance.put(`/integration-trackingble/alarm-warning/${id}`, data, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error) && error.response?.status === 400) {
//       throw error.response.data as ValidationErrorResponse;
//     }
//     throw error;
//   }
// };

// Floor Plan Masked Area
export const getFloorPlanMaskedArea = async (
  integrationId: string,
  token: string,
): Promise<GetFloorPlanMaskedAreaTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/floorplan-masked-area/${integrationId}`,
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

export const getFloorPlanMaskedAreaById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetFloorPlanMaskedAreaTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/floorplan-masked-area/${integrationId}/${id}`,
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

export const updateFloorPlanMaskedArea = async (
  id: string,
  data: UpdateFloorPlanMaskedAreaTrackingRequest,
  token: string,
): Promise<UpdateFloorPlanMaskedAreaTrackingResponse> => {
  try {
    const response = await axiosInstance.put(
      `/integration-trackingble/floorplan-masked-area/${id}`,
      data,
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

// Floor

export const getFloor = async (
  integrationId: string,
  token: string,
): Promise<GetFloorTrackingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-trackingble/floor/${integrationId}`, {
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

export const getFloorById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetFloorTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/floor/${integrationId}/${id}`,
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

export const updateFloor = async (
  id: string,
  data: UpdateFloorTrackingRequest,
  token: string,
): Promise<UpdateFloorTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/floor/${id}`, data, {
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

// Floor Plan

export const getFloorPlan = async (
  integrationId: string,
  token: string,
): Promise<GetFloorPlanTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/floorplan/${integrationId}`,
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

export const getFloorPlanById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetFloorPlanTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/floorplan/${integrationId}/${id}`,
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

export const updateFloorPlan = async (
  id: string,
  data: UpdateFloorPlanTrackingRequest,
  token: string,
): Promise<UpdateFloorPlanTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/floorplan/${id}`, data, {
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

// Access CCTV

export const getAccessCCTV = async (
  integrationId: string,
  token: string,
): Promise<GetCctvTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/access-cctv/${integrationId}`,
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

export const getAccessCCTVById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetCctvTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/access-cctv/${integrationId}/${id}`,
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

export const updateAccessCCTV = async (
  id: string,
  data: UpdateCctvTrackingRequest,
  token: string,
): Promise<UpdateCctvTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/access-cctv/${id}`, data, {
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

// Access Control

export const getAccessControl = async (
  integrationId: string,
  token: string,
): Promise<GetAccessControlTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/access-control/${integrationId}`,
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

export const getAccessControlById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetAccessControlTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/access-control/${integrationId}/${id}`,
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

export const updateAccessControlTracking = async (
  id: string,
  data: UpdateAccessControlTrackingRequest,
  token: string,
): Promise<UpdateAccessControlTrackingResponse> => {
  try {
    const response = await axiosInstance.put(
      `/integration-trackingble/access-control/${id}`,
      data,
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

// Brand

export const getBrandTracking = async (
  integrationId: string,
  token: string,
): Promise<GetBrandTrackingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-trackingble/brand/${integrationId}`, {
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

export const getBrandTrackingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetBrandTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/brand/${integrationId}/${id}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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

export const updateBrandTracking = async (
  id: string,
  data: UpdateBrandTrackingRequest,
  token: string,
): Promise<UpdateBrandTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/brand/${id}`, data, {
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

// Ble Reader

export const getBleReaderTracking = async (
  integrationId: string,
  token: string,
): Promise<GetBleReaderTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/ble-reader/${integrationId}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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

export const getBleReaderTrackingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetBleReaderTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/ble-reader/${integrationId}/${id}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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

// Building

export const getBuildingTracking = async (
  integrationId: string,
  token: string,
): Promise<GetBuildingTrackingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-trackingble/building/${integrationId}`, {
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

export const getBuildingTrackingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetBuildingTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/building/${integrationId}/${id}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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

export const updateBuildingTracking = async (
  id: string,
  data: UpdateBuildingTrackingRequest,
  token: string,
): Promise<UpdateBuildingTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/building/${id}`, data, {
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

// Member

export const getMemberTracking = async (
  integrationId: string,
  token: string,
): Promise<GetMemberTrackingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-trackingble/member/${integrationId}`, {
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

export const getMemberTrackingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetMemberTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/member/${integrationId}/${id}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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

export const updateMemberTracking = async (
  id: string,
  data: UpdateMemberTrackingRequest,
  token: string,
): Promise<UpdateMemberTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/member/${id}`, data, {
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

// Tracking Transaction
export const getTrackingTransaction = async (
  integrationId: string,
  token: string,
): Promise<GetTrackingTransactionResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/tracking-transaction/${integrationId}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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

export const getTrackingTransactionById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetTrackingTransactionResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/tracking-transaction/${integrationId}/${id}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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

// Visitor

export const getVisitorTracking = async (
  integrationId: string,
  token: string,
): Promise<GetVisitorTrackingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-trackingble/visitor/${integrationId}`, {
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

export const getVisitorTrackingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetVisitorTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/visitor/${integrationId}/${id}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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

export const updateVisitorTracking = async (
  id: string,
  data: UpdateVisitorTrackingRequest,
  token: string,
): Promise<UpdateVisitorTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/visitor/${id}`, data, {
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

//# Visitor Blacklist

export const getVisitorBlacklist = async (
  integrationId: string,
  token: string,
): Promise<GetVisitorBlacklistAreaTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/visitor-blacklist-area/${integrationId}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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

export const getVisitorBlacklistById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetVisitorBlacklistAreaTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/visitor-blacklist-area/${integrationId}/${id}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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

export const updateVisitorBlacklist = async (
  id: string,
  data: UpdateVisitorBlacklistAreaTrackingRequest,
  token: string,
): Promise<UpdateVisitorBlacklistAreaTrackingResponse> => {
  try {
    const response = await axiosInstance.put(
      `/integration-trackingble/visitor-blacklist-area/${id}`,
      data,
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

// TRX Visitor

export const getTRXVisitor = async (
  integrationId: string,
  token: string,
): Promise<GetTrxVisitorTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/trx-visitor/${integrationId}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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

export const getTRXVisitorById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetTrxVisitorTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/trx-visitor/${integrationId}/${id}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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

export const updateTRXVisitor = async (
  id: string,
  data: UpdateTrxVisitorTrackingRequest,
  token: string,
): Promise<UpdateTrxVisitorTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/trx-visitor/${id}`, data, {
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
