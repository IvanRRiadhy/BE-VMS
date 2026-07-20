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
} from './models/Admin/Department';
import {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  DeleteOrganizationResponse,
  GetAllOrganizationById,
  GetAllOrganizationPaginationResponse,
  GetAllOrganizationResponse,
  UpdateOrganizationRequest,
  UpdateOrganizationResponse,
} from './models/Admin/Organization';
import {
  CreateDistrictRequest,
  CreateDistrictResponse,
  DeleteDistrictResponse,
  GetAllDistrictsPaginationResponse,
  GetDistrictByIdResponse,
  UpdateDistrictRequest,
  UpdateDistrictResponse,
} from './models/Admin/District';
import axiosInstance from './interceptor';
import {
  CreateEmployeeRequest,
  GetAllEmployeePaginationResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
  DeleteEmployeeResponse,
  UploadImageEmployeeResponse,
  GetAllEmployeeResponse,
} from './models/Admin/Employee';
import {
  CreateDocumentRequest,
  CreateDocumentResponse,
  GetAllDocumentPaginationResponse,
  UpdateDocumentRequest,
  UpdateDocumentResponse,
  GetAllDocumentResponse,
} from './models/Admin/Document';
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
  CreateSiteAccessRequest,
  UpdateSiteAccessRequest,
  UpdateSiteAccessResponse,
} from './models/Admin/Sites';
import {
  CreateSiteDocumentRequest,
  CreateSiteDocumentResponse,
  GetAllSiteDocumentResponse,
} from './models/Admin/SiteDocument';
import {
  GetAllBrandPaginationResponse,
  GetAllBrandResponse,
  UpdateBrandResponse,
} from './models/Admin/Brand';
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
} from './models/Admin/Integration';
import {
  CreateAccessControlRequest,
  CreateAccessControlResponse,
  GetAccessControlByIdResponse,
  GetAccessControlPaginationResponse,
  GetAllAccessControlResponse,
  UpdateAccessControlRequest,
  UpdateAccessControlResponse,
} from './models/Admin/AccessControl';
import {
  CreateCustomFieldRequest,
  CreateCustomFieldResponse,
  GetAllCustomFieldPaginationResponse,
  GetAllCustomFieldResponse,
  UpdateCustomFieldRequest,
  UpdateCustomFieldResponse,
} from './models/Admin/CustomField';

import {
  GetAllVisitorTypePaginationResponse,
  CreateVisitorTypeResponse,
  CreateVisitorTypeRequest,
  DeleteVisitorTypeResponse,
  UpdateVisitorTypeResponse,
  GetVisitorTypeByIdResponse,
  UpdateVisitorTypeRequest,
  GetAllVisitorTypeResponse,
} from './models/Admin/VisitorType';
import {
  GetAllVisitorPaginationResponse,
  CreateVisitorRequest,
  CreateVisitorResponse,
  DeleteVisitorResponse,
  CreateGroupVisitorRequest,
} from './models/Admin/Visitor';

import {
  CreateVisitorCardRequest,
  GetAllVisitorCardPaginationResponse,
  GetAllVisitorCardResponse,
  GetAvailableCardResponse,
  GetGetVisitorCardByIdResponse,
  UpdateVisitorCardRequest,
  UpdateVisitorCardResponse,
} from './models/Admin/VisitorCard';
import {
  CreateEmailRequest,
  CreateEmailResponse,
  CreateSettingSmtpRequest,
  CreateSettingSmtpResponse,
  GetAllSettingSmtpPaginationResponse,
  GetAllSettingSmtpResponse,
  UpdateSettingSmtpRequest,
  UpdateSettingSmtpResponse,
} from './models/Admin/SettingSmtp';
import {
  CreateTimezoneRequest,
  CreateTimezoneResponse,
  DeleteTimezoneResponse,
  GetAllTimezonePaginationResponse,
  GetAllTimezoneResponse,
  GetTimezoneByIdResponse,
  UpdateTimezoneRequest,
  UpdateTimezoneResponse,
} from './models/Admin/Timezone';
import {
  CreateCheckGiveAccessRequest,
  CreateCheckGiveAccessResponse,
  GetAllGrantAccessResponse,
} from './models/Admin/GrantAccess';
import { GetAllUserResponse, GetUserByIdResponse } from './models/Admin/User';

import { GetAllSettingResponse } from './models/Admin/Setting';

//#region report

export const generateReport = async (payload: any): Promise<any> => {
  const response = await axiosInstance.post('/report/visitor-transaction/generate', payload);
  return response.data;
};
//#region User

//#region Blacklist

// get blacklist
export const getBlacklist = async (): Promise<any> => {
  const response = await axiosInstance.get('/visitor/blacklist');
  return response.data;
};

// get by id
export const getBlacklistById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get('/visitor/blacklist/' + id);
  return response.data;
};

// get dt
export const getBlacklistDt = async (
  start: number,
  sortDir: string,
  length: number,
  keyword: string = '',
  startDate?: string,
  endDate?: string,
  visitor?: string,
  status?: string | boolean,
): Promise<any> => {
  const params: any = {
    start,
    length,
    sort_dir: sortDir,
  };

  if (keyword) params['search[value]'] = keyword;
  if (startDate) params['start-date'] = startDate;
  if (endDate) params['end-date'] = endDate;
  if (visitor) params.visitor = visitor;

  if (status !== undefined && status !== '' && status !== null) {
    params['status-blacklist'] =
      status === 'true' || status === true
        ? true
        : status === 'false' || status === false
          ? false
          : status;
  }

  const response = await axiosInstance.get('/visitor/blacklist/dt', {
    params,
  });

  return response.data;
};

// create
export const createBlacklist = async (data: any): Promise<any> => {
  const response = await axiosInstance.post(`/visitor/blacklist`, data);

  return response.data;
};

export const createEmployeeBlacklist = async (data: any): Promise<any> => {
  const response = await axiosInstance.post(`/employee/blacklist`, data);

  return response.data;
};

//endregion

// Operator Setting Give Access
export const getOperatorSettingRegiterSiteById = async (id: string): Promise<any> => {
  const response = axiosInstance.get(`/operator-register-site/user/${id}`);
  return response;
};

// Create
export const createOperatorSettingRegiterSite = async (data: any, id: string): Promise<any> => {
  const response = await axiosInstance.post('/operator-register-site/user/' + id, data);
  return response.data;
};

// Delete
export const deleteOperatorSettingRegiterSite = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete('/operator-register-site/user/' + id);
  return response.data;
};

// Operator Setting Give Access
export const getOperatorSettingGiveAccessById = async (id: string): Promise<any> => {
  const response = axiosInstance.get(`/operator-give-access/user/${id}`);
  return response;
};

// Create
export const createOperatorSettingGiveAccess = async (data: any, id: string): Promise<any> => {
  const response = await axiosInstance.post('/operator-give-access/user/' + id, data);
  return response.data;
};

// Delete
export const deleteOperatorSettingGiveAccess = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete('/operator-give-access/user/' + id);
  return response.data;
};

// Operator Site Access
export const getOperatorSiteAccessById = async (id: string): Promise<any> => {
  const response = axiosInstance.get(`/operator-site-access/user/${id}`);
  return response;
};

// Create
export const createOperatorSiteAccess = async (data: any, id: string): Promise<any> => {
  const response = await axiosInstance.post('/operator-site-access/user/' + id, data);
  return response.data;
};

// Delete
export const deleteOperatorSiteAccess = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete('/operator-site-access/user/' + id);
  return response.data;
};

// Operator vms user
export const getAllUserOperatorVms = async (): Promise<any> => {
  const response = await axiosInstance.get('/user/operator-vms');
  return response.data;
};

export const getAllUser = async (): Promise<any> => {
  const response = await axiosInstance.get('/user');
  return response.data;
};

export const getUserById = async (id: string): Promise<GetUserByIdResponse> => {
  const response = await axiosInstance.get(`/user/${id}`);
  return response.data;
};

export const createUser = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/user', data);
  return response.data;
};

export const updateUser = async (id: string, data: any): Promise<any> => {
  const response = await axiosInstance.put(`/user/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user/${id}`);
  return response.data;
};

// User Group
export const getAllUserGroup = async (): Promise<any> => {
  const response = await axiosInstance.get('/user-group');
  return response.data;
};

export const getUserGroupById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/user-group/${id}`);
  return response.data;
};

// getdt
export const getUserGroupDt = async (
  start: number,
  length: number,
  keyword: string = '',
  sort_dir?: string,
  start_date?: string,
  end_date?: string,
): Promise<any> => {
  const response = await axiosInstance.get('/user-group/dt', {
    params: {
      start,
      length,
      sort_dir: sort_dir,
      'search[value]': keyword,
      start_date,
      end_date,
    },
  });
  return response.data;
};

export const createUserGroup = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/user-group', data);
  return response.data;
};

export const updateUserGroup = async (id: string, data: any): Promise<any> => {
  const response = await axiosInstance.put(`/user-group/${id}`, data);
  return response.data;
};

export const deleteUserGroup = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user-group/${id}`);
  return response.data;
};

// Permission
export const getAllPermission = async (groupId: string): Promise<any> => {
  const response = await axiosInstance.get('/user-group-permission/group/' + groupId);
  return response.data;
};

export const getPermissionById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/user-group-permission/${id}`);
  return response.data;
};

export const createPermission = async (data: any, groupId: string): Promise<any> => {
  const response = await axiosInstance.post(`/user-group-permission/group/${groupId}`, data);
  return response.data;
};

export const deletePermission = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user-group-permission/group/${id}`);
  return response.data;
};

// permission site
export const getAllPermissionSite = async (groupId: string): Promise<any> => {
  const response = await axiosInstance.get('/user-group-site/group/' + groupId);
  return response.data;
};

export const getPermissionSiteById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/user-group-site/${id}`);
  return response.data;
};

export const createPermissionSite = async (data: any, groupId: string): Promise<any> => {
  const response = await axiosInstance.post(`/user-group-site/group/${groupId}`, data);
  return response.data;
};

export const deletePermissionSite = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user-group-site/group/${id}`);
  return response.data;
};

// permission register site
export const getAllPermissionRegisterSite = async (groupId: string): Promise<any> => {
  const response = await axiosInstance.get('/user-group-registersite/group/' + groupId);
  return response.data;
};

export const getPermissionRegisterSiteById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/user-group-registersite/${id}`);
  return response.data;
};

export const createPermissionRegisterSite = async (data: any, groupId: string): Promise<any> => {
  const response = await axiosInstance.post(`/user-group-registersite/group/${groupId}`, data);
  return response.data;
};

export const deletePermissionRegisterSite = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user-group-registersite/group/${id}`);
  return response.data;
};

// permission organization
export const getAllPermissionOrganization = async (groupId: string): Promise<any> => {
  const response = await axiosInstance.get('/user-group-org/group/' + groupId);
  return response.data;
};

export const getPermissionOrganizationById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/user-group-org/${id}`);
  return response.data;
};

export const createPermissionOrganization = async (data: any, groupId: string): Promise<any> => {
  const response = await axiosInstance.post(`/user-group-org/group/${groupId}`, data);
  return response.data;
};

export const deletePermissionOrganization = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user-group-org/group/${id}`);
  return response.data;
};

// permission manage visitor
export const getAllPermissionManageVisitor = async (groupId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/user-group-managevisitor/group/' + groupId);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getPermissionManageVisitorById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/user-group-managevisitor/${id}`);
  return response.data;
};

export const createPermissionManageVisitor = async (data: any, groupId: string): Promise<any> => {
  const response = await axiosInstance.post('/user-group-managevisitor/group/' + groupId, data);
  return response.data;
};

export const deletePermissionManageVisitor = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user-group-managevisitor/group/${id}`);
  return response.data;
};

//#endregion
export const updateExtend = async (data: any): Promise<any> => {
  const response = await axiosInstance.put(`invitation/extend-period`, data);
  return response.data;
};
export const getAccessPass = async (): Promise<any> => {
  const response = await axiosInstance.get('/dashboard/access-pass');
  // console.log('response', response);
  return response.data.collection[0];
};

// #region Setting

export const getSetting = async (): Promise<GetAllSettingResponse> => {
  const response = await axiosInstance.get('/setting/visitor');
  return response.data;
};
export const updateSetting = async (id: string, data: any): Promise<any> => {
  const response = await axiosInstance.put(`/setting/visitor/${id}`, data);
  return response.data;
};

//

// #region Dashboard
export const getTopVisitingPurpose = async (start_date: string, end_date: string): Promise<any> => {
  const params = {
    'start-date': start_date,
    'end-date': end_date,
  };
  const response = await axiosInstance.get('/dashboard/top/purposes', {
    params,
  });
  return response.data;
};

export const getTopVisitors = async (start_date: string, end_date: string): Promise<any> => {
  const params = {
    'start-date': start_date,
    'end-date': end_date,
  };
  const response = await axiosInstance.get('/dashboard/top/visitors', {
    params,
  });
  return response.data;
};

export const getAvarageDuration = async (start_date: string, end_date: string): Promise<any> => {
  const params = {
    'start-date': start_date,
    'end-date': end_date,
  };
  const response = await axiosInstance.get('/dashboard/average-duration', {
    params,
  });
  return response.data;
};

export const getRepeatsVisitor = async (start_date: string, end_date: string): Promise<any> => {
  const params = {
    'start-date': start_date,
    'end-date': end_date,
  };
  const response = await axiosInstance.get('/dashboard/repeats-visitor', {
    params,
  });
  return response.data;
};

export const getVisitorChart = async (start_date: string, end_date: string): Promise<any> => {
  const params = {
    'start-date': start_date,
    'end-date': end_date,
  };
  const response = await axiosInstance.get('/dashboard/visitor-chart', {
    params,
  });
  return response.data;
};

export const getHeatmaps = async (start_date: string, end_date: string): Promise<any> => {
  const params = {
    'start-date': start_date,
    'end-date': end_date,
  };
  const response = await axiosInstance.get('/dashboard/heatmaps', {
    params,
  });
  return response.data;
};

export const getTodayVisitorCount = async (start_date: string, end_date: string): Promise<any> => {
  const response = await axiosInstance.get('/dashboard/today-visitor-count', {
    params: { 'start-date': start_date, 'end-date': end_date },
  });
  return response.data;
};

export const getTodayPraregister = async (start_date: string, end_date: string): Promise<any> => {
  const response = await axiosInstance.get('/dashboard/today/praregister', {
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

export const getAllTimezone = async (): Promise<GetAllTimezoneResponse> => {
  const response = await axiosInstance.get('/time-access', {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getAllTimezonePagination = async (
  start: number,
  length: number,
  keyword?: string,
): Promise<any> => {
  const params: Record<string, any> = {
    start,
    length,
  };

  if (keyword?.trim()) {
    params['search[value]'] = keyword;
  }

  const response = await axiosInstance.get('/time-access/dt', {
    headers: { Accept: 'application/json' },
    params,
  });

  return response.data;
};

export const getTimezoneById = async (id: string): Promise<GetTimezoneByIdResponse> => {
  const response = await axiosInstance.get(`/time-access/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const createTimezone = async (
  data: CreateTimezoneRequest,
): Promise<CreateTimezoneResponse> => {
  const response = await axiosInstance.post('/time-access', data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const updateTimezone = async (
  id: string,
  data: UpdateTimezoneRequest,
): Promise<UpdateTimezoneResponse> => {
  const response = await axiosInstance.put(`/time-access/${id}`, data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const deleteTimezone = async (id: string): Promise<DeleteTimezoneResponse> => {
  const response = await axiosInstance.delete(`/time-access/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

//#endregion

//#region Card
export const getAllVisitorCard = async (): Promise<GetAllVisitorCardResponse> => {
  const response = await axiosInstance.get('/card', {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getVisitorCardById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/card/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getAvailableCard = async (
  registered_site: string,
): Promise<GetAvailableCardResponse> => {
  const params = {
    'registered-site': registered_site,
  };

  const response = await axiosInstance.get('/card/available-cards', {
    headers: { Accept: 'application/json' },
    params,
  });
  return response.data;
};

export const getAllVisitorCardPagination = async (
  start: number,
  length: number,
  keyword: string = '',
  sort_dir?: string,
  type?: number | null,
  cardStatus?: number, // ← ubah nama jadi camelCase
): Promise<GetAllVisitorCardPaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    sort_dir,
  };

  if (keyword?.trim()) params['search[value]'] = keyword.trim();

  if (type !== undefined && type !== null) {
    params.type = type;
  }

  if (cardStatus !== undefined && cardStatus !== null) {
    params['card-status'] = cardStatus; // API tetap butuh format snake-case / kebab-case
  }

  const response = await axiosInstance.get('/card/dt', {
    headers: {
      Accept: 'application/json',
    },
    params,
  });

  return response.data;
};

// create batch

export const createBatchVisitor = async (
  data: CreateVisitorCardRequest[],
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('card/create-batch', data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const createVisitorCard = async (
  data: CreateVisitorCardRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/card', data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const updateVisitorCard = async (
  id: string,
  data: UpdateVisitorCardRequest,
): Promise<UpdateVisitorCardResponse> => {
  const response = await axiosInstance.put(`/card/${id}`, data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const deleteVisitorCard = async (id: string): Promise<DeleteVisitorResponse> => {
  const response = await axiosInstance.delete(`/card/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

//#region Visitor
// Get  All
export const getAllVisitor = async (): Promise<any> => {
  const response = await axiosInstance.get('/visitor', {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getListVisitor = async (): Promise<any> => {
  const response = await axiosInstance.get('/visitor/invitation', {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getListVisitorPagination = async (
  start: number,
  length: number | undefined,
  sortDir = '',
  keyword: string = '',
  // filters: Record<string, any> = {},
): Promise<any> => {
  // const cleanedFilters = Object.fromEntries(
  //   Object.entries(filters)
  //     .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
  //     .map(([k, v]) => [k.replace(/_/g, '-'), v]),
  // );

  const params: Record<string, any> = {
    start,
    length,
    sort_dir: sortDir,
    'search[value]': keyword,
    // ...cleanedFilters,
  };

  const response = await axiosInstance.get('/visitor/invitation/dt', {
    headers: {
      Accept: 'application/json',
    },
    params,
  });

  return response.data;
};

// Get by invitation
export const getVisitorInvitation = async (): Promise<any> => {
  const response = await axiosInstance.get('/visitor/invitation', {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

// Get By Id
export const getVisitorById = async (id: string): Promise<GetAllVisitorTypePaginationResponse> => {
  const response = await axiosInstance.get(`/visitor/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

// Pagination
export const getAllVisitorPagination = async (
  start: number,
  length: number,
  // sortDir = '',
  keyword?: string,
  start_date?: string,
  end_date?: string,
  visitor_status?: string,
  data_filter?: string,
  site?: string,
  visitor_role?: string,
  is_emergency?: boolean,
  is_block?: boolean,
  host?: string,
): Promise<any> => {
  const params: Record<string, any> = {
    // draw,
    start,
    length,
    // sort_dir: sortDir,
    'search[value]': keyword,
    'start-date': start_date,
    'end-date': end_date,
    status: visitor_status,
    'date-filter-type': data_filter,
    site: site,
    'visitor-role': visitor_role,
    'is-emergency-situation': is_emergency,
    'is-block': is_block,
    host: host,
  };

  const response = await axiosInstance.get('/visitor/dt', {
    headers: { Accept: 'application/json' },
    params,
  });
  return response.data;
};

// Create
export const createVisitor = async (data: CreateVisitorRequest): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/visitor/new-visit', data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const createVisitors = async (
  data: CreateGroupVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/visitor/new-visit', data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const createVisitorsGroup = async (
  data: CreateGroupVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/visitor/new-visit-group', data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

// Pra Register
export const createPraRegister = async (
  data: CreateVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/visitor/new-pra-invite', data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const createPraRegisterGroup = async (
  data: CreateGroupVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/visitor/new-pra-invite-group', data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

// Update
export const updateVisitor = async (
  id: string,
  data: CreateVisitorRequest,
): Promise<UpdateVisitorTypeResponse> => {
  const response = await axiosInstance.put(`/visitor/${id}`, data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

// Delete
export const deleteVisitor = async (visitId: string): Promise<DeleteVisitorResponse> => {
  const response = await axiosInstance.delete(`/visitor/${visitId}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

// Transaction Visitor
// Get
export const getVisitorTransaction = async (token: string): Promise<any> => {
  const response = await axiosInstance.get('/visitor/transaction', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getVisitorTransactionById = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.get(`/visitor/transaction/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const getVisitorTransactionByIds = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/visitor/transaction/${id}/visitors`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getVisitorTransactionPagination = async (
  start: number,
  length: number,
  // sortColumn: string,
  sortDir = 'desc',
  keyword?: string,
  start_date?: string,
  end_date?: string,
  status?: string,
  data_filter?: string,
  transaction_status?: string,
  site?: string,
  visitor_role?: string,
  is_emergency?: boolean,
  is_block?: boolean,
  host?: string,
): Promise<any> => {
  const response = await axiosInstance.get(`/visitor/transaction/dt`, {
    params: {
      start,
      length,
      sort_dir: sortDir,
      'search[value]': keyword,
      'start-date': start_date,
      'end-date': end_date,
      'visitor-status': status,
      'date-filter-type': data_filter,
      'transaction-status': transaction_status,
      site: site,
      'visitor-role': visitor_role,
      'is-emergency-situation': is_emergency,
      'is-block': is_block,
      host: host,
    },
    headers: { Accept: 'application/json' },
  });
  return response.data;
};
//end visitor

//#region Visitor Type

// Get Camera Anaytics
export const getCameraAnalytics = async (): Promise<any> => {
  const response = await axiosInstance.get('/integration/camera-analytics', {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

// Get All
export const getAllVisitorType = async (): Promise<GetAllVisitorTypeResponse> => {
  const response = await axiosInstance.get('/visitor-type', {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

// Get by id visitor type
export const getVisitorTypeById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/visitor-type/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

// Get Visitor Type Paginaton
export const getAllVisitorTypePagination = async (
  start: number,
  length: number,
  sort_dir: string,
  keyword: string = '',
): Promise<GetAllVisitorTypePaginationResponse> => {
  const response = await axiosInstance.get(`/visitor-type/dt`, {
    params: {
      start,
      length,
      sort_dir: sort_dir,
      'search[value]': keyword,
    },
    headers: { Accept: 'application/json' },
  });

  return response.data;
};

// getall visitor typepagination
export const createVisitorType = async (
  data: CreateVisitorTypeRequest,
): Promise<CreateVisitorTypeResponse> => {
  const response = await axiosInstance.post(`/visitor-type`, data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const updateVisitorType = async (
  visitorId: string,
  data: any,
): Promise<UpdateVisitorTypeResponse> => {
  console.log(data);
  const response = await axiosInstance.put(`/visitor-type/${visitorId}`, data, {
    headers: { Accept: 'application/json' },
  });

  return response.data;
};

export const deleteVisitorType = async (visitorId: string): Promise<DeleteVisitorTypeResponse> => {
  const response = await axiosInstance.delete(`/visitor-type/${visitorId}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

//#region District API
export const getAllDistricts = async (): Promise<GetAllDistrictsPaginationResponse> => {
  const response = await axiosInstance.get(`/district`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};
export const getAllDistrictsPagination = async (
  start: number,
  length: number,
  // sortColumn: string,
  sortDir?: string,
  keyword: string = '',
): Promise<GetAllDistrictsPaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    'search[value]': keyword,
  };

  if (sortDir) {
    params.sort_dir = sortDir;
  }

  const response = await axiosInstance.get(`/district/dt`, {
    params,
    headers: {
      Accept: 'application/json',
    },
  });

  return response.data;
};
// get by id district
export const getDistrictById = async (id: string): Promise<GetDistrictByIdResponse> => {
  const response = await axiosInstance.get(`/district/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};
export const updateDistrict = async (
  districtId: string,
  data: UpdateDistrictRequest,
): Promise<UpdateDistrictResponse> => {
  try {
    const response = await axiosInstance.put(`/district/${districtId}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const deleteDistrict = async (districtId: string): Promise<DeleteDistrictResponse> => {
  const response = await axiosInstance.delete(`/district/${districtId}`);
  return response.data;
};
export const createDistrict = async (
  data: CreateDistrictRequest,
): Promise<CreateDistrictResponse> => {
  try {
    const response = await axiosInstance.post(`/district`, data);
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
export const getAllDepartments = async (): Promise<GetAllDepartmetsPaginationResponse> => {
  const response = await axiosInstance.get(`/department`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};
export const getAllDepartmentsPagination = async (
  start: number,
  length: number,
  sortDir?: string,
  keyword: string = '',
): Promise<GetAllDepartmetsPaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    'search[value]': keyword,
  };

  if (sortDir) {
    params.sort_dir = sortDir;
  }

  const response = await axiosInstance.get(`/department/dt`, {
    params,
    headers: {
      Accept: 'application/json',
    },
  });

  return response.data;
};
// get by id department

export const getDepartmentById = async (id: string) => {
  const response = await axiosInstance.get(`/department/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const updateDepartment = async (
  departmentId: string,
  data: UpdateDepartmentRequest,
): Promise<UpdateDepartmentResponse> => {
  try {
    const response = await axiosInstance.put(`/department/${departmentId}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};
export const deleteDepartment = async (departmentId: string): Promise<DeleteDepartmentResponse> => {
  const response = await axiosInstance.delete(`/department/${departmentId}`);
  return response.data;
};
export const createDepartment = async (
  data: CreateDepartmentRequest,
): Promise<CreateDepartmentResponse> => {
  try {
    const response = await axiosInstance.post(`/department`, data);
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
export const getAllOrganizations = async (): Promise<GetAllOrganizationResponse> => {
  const response = await axiosInstance.get(`/organization`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};
export const getAllOrganizationPagination = async (
  start: number,
  length: number,
  sortDir?: string,
  keyword: string = '',
): Promise<GetAllOrganizationPaginationResponse> => {
  // bikin object params dulu
  const params: Record<string, any> = {
    start,
    length,
    'search[value]': keyword,
  };

  if (sortDir) {
    params.sort_dir = sortDir;
  }

  const response = await axiosInstance.get(`/organization/dt`, {
    params,
    headers: {
      Accept: 'application/json',
    },
  });

  return response.data;
};

// get by id organization
export const getOrganizationById = async (id: string): Promise<GetAllOrganizationById> => {
  const response = await axiosInstance.get(`/organization/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const updateOrganization = async (
  organizationId: string,
  data: UpdateOrganizationRequest,
): Promise<UpdateOrganizationResponse> => {
  try {
    const response = await axiosInstance.put(`/organization/${organizationId}`, data);
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
): Promise<CreateOrganizationResponse> => {
  try {
    const response = await axiosInstance.post(`/organization`, data);
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
): Promise<DeleteOrganizationResponse> => {
  const response = await axiosInstance.delete(`/organization/${organizationId}`);
  return response.data;
};
//#endregion

//#region Document API

// Get aLL
export const getAllDocument = async (): Promise<GetAllDocumentResponse> => {
  const response = await axiosInstance.get(`/document`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getAllDocumentPagination = async (
  start: number,
  length: number,
  sortDir?: string,
  keyword?: string,
): Promise<any> => {
  try {
    const params: Record<string, any> = {
      start,
      length,
      sort_dir: sortDir,
    };

    if (keyword) {
      params['search[value]'] = keyword;
    }

    const response = await axiosInstance.get('/document/dt', {
      params,
      headers: {
        Accept: 'application/json',
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

export const createDocument = async (
  data: CreateDocumentRequest,
): Promise<CreateDocumentResponse> => {
  try {
    const response = await axiosInstance.post(`/document`, data);
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
): Promise<UpdateDocumentResponse> => {
  try {
    const response = await axiosInstance.put(`/document/${documentId}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const deleteDocument = async (documentId: string): Promise<DeleteOrganizationResponse> => {
  const response = await axiosInstance.delete(`/document/${documentId}`);
  return response.data;
};
//#endregion

//#region Employee API

export const getAllEmployee = async (): Promise<GetAllEmployeeResponse> => {
  const response = await axiosInstance.get(`/employee`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getVisitorEmployee = async (): Promise<GetAllEmployeeResponse> => {
  const response = await axiosInstance.get(`/employee/get-visitor-employee`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getFormEmployee = async (
  token: string,
  status_employee?: string, // 🔹 dibuat opsional
): Promise<GetAllEmployeeResponse> => {
  try {
    const params: Record<string, any> = {};

    if (status_employee) params['status-employee'] = status_employee;

    const response = await axiosInstance.get(`/employee`, {
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

export const getEmployeeById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/employee/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getAllEmployeePagination = async (
  start?: number,
  length?: number,
  sortColumn?: string,
  sortDir?: string,
  keyword: string = '',
  gender?: number,
  joinStart?: string,
  exitEnd?: string,
  statusEmployee?: number,
  organization?: string,
  district?: string,
  department?: string,
): Promise<any> => {
  const params: Record<string, any> = {};

  if (start !== undefined) params.start = start;
  if (length !== undefined) params.length = length;
  if (sortColumn) params.sort_column = sortColumn;
  if (sortDir) params.sort_dir = sortDir;

  if (keyword) params['search[value]'] = keyword;
  if (gender !== undefined && gender !== -1) params.gender = gender;
  if (joinStart) params['join-start'] = joinStart;
  if (exitEnd) params['exit-end'] = exitEnd;
  if (statusEmployee !== undefined && statusEmployee !== -1) {
    params['status-employee'] = statusEmployee;
  }
  if (organization && organization !== '0') {
    params.organization = organization;
  }
  if (district && district !== '0') {
    params.district = district;
  }
  if (department && department !== '0') {
    params.department = department;
  }

  try {
    const response = await axiosInstance.get(`/employee/dt`, {
      params: params,
      headers: {
        Accept: 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    if (
      error?.response?.data?.status === 'not_found' ||
      error?.response?.data?.status_code === 404
    ) {
      return {
        collection: [],
        RecordsTotal: 0,
        RecordsFiltered: 0,
      };
    }

    throw error;
  }
};

export const getAllEmployeePaginationFilterMore = async (
  start: number,
  length: number,
  sortDir?: string,
  keyword: string = '',
  gender?: number,
  joinStart?: string,
  exitEnd?: string,
  statusEmployee?: number,
  organization?: string,
  district?: string,
  department?: string,
): Promise<GetAllEmployeePaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    sort_dir: sortDir,
  };

  if (keyword) params['search[value]'] = keyword;
  if (gender !== undefined && gender !== -1) params.gender = gender;
  if (joinStart) params['join-start'] = joinStart;
  if (exitEnd) params['exit-end'] = exitEnd;
  if (statusEmployee !== undefined && statusEmployee !== -1)
    params['status-employee'] = statusEmployee;
  if (organization && organization !== '0' && organization !== '')
    params.organization = organization;
  if (district && district !== '0' && district !== '') params.district = district;
  if (department && department !== '0' && department !== '') params.department = department;

  const response = await axiosInstance.get(`/employee/dt`, {
    params,
  });

  return response.data;
};

export const createEmployee = async (data: CreateEmployeeRequest): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/employee`, data);
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
): Promise<UpdateEmployeeResponse> => {
  try {
    const response = await axiosInstance.put(`/employee/${employeeId}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const deleteEmployee = async (employeeId: string): Promise<DeleteEmployeeResponse> => {
  const response = await axiosInstance.delete(`/employee/${employeeId}`);
  return response.data;
};

export const uploadImageEmployee = async (
  employeeId: string,
  data: any,
): Promise<UploadImageEmployeeResponse> => {
  try {
    const formData = new FormData();
    formData.append('faceimage', data);
    const response = await axiosInstance.post(`/employee/upload/${employeeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload Image Site Response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

// Blacklist Employee
export const getAllEmployeeBlacklistPagination = async (
  start: number,
  length: number,
  // sortColumn: string,
  sortDir?: string,
  keyword: string = '',
  // joinStart?: string,
  // exitEnd?: string,
  statusBlacklist?: boolean,
): Promise<GetAllEmployeePaginationResponse> => {
  const params: Record<string, any> = {
    start,
    length,
    // sort_column: sortColumn,
    sort_dir: sortDir,
  };

  if (keyword) params['search[value]'] = keyword;
  // if (joinStart) params['join-start'] = joinStart;
  // if (exitEnd) params['exit-end'] = exitEnd;
  if (statusBlacklist !== undefined) params['status-blacklist'] = statusBlacklist;

  const response = await axiosInstance.get(`/employee/blacklist/dt`, {
    params,
  });

  return response.data;
};

//#endregion

//#region Site API
export const getAllSitePagination = async (
  start: number,
  length: number,
  sortDir?: string,
  keyword: string = '',
  type?: number,
  parent?: string,
  is_child?: boolean,
): Promise<any> => {
  const response = await axiosInstance.get(`/site/dt`, {
    params: {
      start,
      length,
      sort_dir: sortDir,
      ...(keyword ? { 'search[value]': keyword } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(parent ? { parent } : {}),
      ...(is_child !== undefined ? { 'is-child': is_child } : {}),
    },
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getAllSite = async (): Promise<GetAllSitesResponse> => {
  const response = await axiosInstance.get(`/site`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getRegisteredSite = async (): Promise<GetAllSitesResponse> => {
  const response = await axiosInstance.get(`/site/registered-point`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getSiteById = async (id: string): Promise<GetSiteByIdResponse> => {
  const response = await axiosInstance.get(`/site/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};
export const getSitesParking = async (): Promise<any> => {
  const response = await axiosInstance.get(`/site-parking`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getSitesTracking = async (): Promise<any> => {
  const response = await axiosInstance.get(`/site-tracking`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getSitesAccess = async (): Promise<any> => {
  const response = await axiosInstance.get(`/site-access`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getSitesAccessById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/site-access/site/${id} `, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getSiteParking = async (): Promise<any> => {
  const response = await axiosInstance.get(`/integration-parking/area`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getSiteTracking = async (): Promise<any> => {
  const response = await axiosInstance.get(`/integration-trackingble/card-access`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const createSite = async (data: CreateSiteRequest): Promise<CreateSiteResponse> => {
  try {
    const response = await axiosInstance.post(`/site`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const getSiteParkingById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/site-parking/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const createSiteParking = async (
  data: CreateSiteParkingRequest,
): Promise<CreateSiteResponse> => {
  try {
    const response = await axiosInstance.post(`/site-parking`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const createSiteParkingBulk = async (data: any): Promise<CreateSiteResponse> => {
  try {
    const response = await axiosInstance.post(`/site-parking/bulk`, data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const createSiteAccess = async (
  data: CreateSiteAccessRequest,
): Promise<CreateSiteResponse> => {
  try {
    const response = await axiosInstance.post(`/site-access`, data);
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
): Promise<CreateSiteResponse> => {
  try {
    const response = await axiosInstance.post(`/site-tracking`, data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const createSiteTrackingBulk = async (data: any): Promise<CreateSiteResponse> => {
  try {
    const response = await axiosInstance.post(`/site-tracking/bulk`, data);
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
  data: any,
): Promise<UpdateSiteTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/site-tracking/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const deleteSiteTracking = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/site-tracking/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const updateSiteAccess = async (
  id: string,
  data: any,
): Promise<UpdateSiteAccessResponse> => {
  try {
    const response = await axiosInstance.put(`/site-access/${id}`, data);
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
  data: any,
): Promise<UpdateSiteParkingResponse> => {
  try {
    const response = await axiosInstance.put(`/site-parking/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const deleteSiteParking = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/site-parking/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const updateSite = async (siteId: string, data: any): Promise<UpdateSiteResponse> => {
  try {
    const response = await axiosInstance.put(`/site/${siteId}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const deleteSiteSpace = async (siteId: string): Promise<DeleteSiteResponse> => {
  const response = await axiosInstance.delete(`/site/${siteId}`);
  return response.data;
};

export const uploadImageSite = async (
  siteId: string,
  data: File,
): Promise<UploadImageSiteResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', data);
    const response = await axiosInstance.post(`/site/upload/${siteId}`, formData, {
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

export const getSiteDocumentBySiteId = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/site-document/site/${id}`, {
      headers: { Accept: 'application/json' },
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
): Promise<CreateSiteDocumentResponse> => {
  try {
    const response = await axiosInstance.post(`/site-document`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

// delete
export const deleteSiteDocument = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/site-document/${id}`);
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
  start: number,
  length: number,
  // sortColumn: string,
  keyword: string = '',
): Promise<GetAllBrandPaginationResponse> => {
  try {
    const response = await axiosInstance.get(`/brand/dt`, {
      params: { start, length, 'search[value]': keyword },
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const deleteBrand = async (brandId: string): Promise<UpdateBrandResponse> => {
  try {
    const response = await axiosInstance.delete(`/brand/${brandId}`);
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
export const getAllAccessControl = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/access-control`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const getAccessControlsById = async (id: string): Promise<GetAccessControlByIdResponse> => {
  try {
    const response = await axiosInstance.get(`/access-control/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const getAllAccessControlPagination = async (
  start: number,
  length: number,
  sortColumn: string,
  keyword?: string,
): Promise<GetAccessControlPaginationResponse> => {
  try {
    const response = await axiosInstance.get(`/access-control/dt`, {
      params: { start, length, sort_column: sortColumn, 'search[value]': keyword },
      headers: { Accept: 'application/json' },
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
): Promise<CreateAccessControlResponse> => {
  try {
    const response = await axiosInstance.post(`/access-control`, data);
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
): Promise<DeleteIntegrationResponse> => {
  try {
    const response = await axiosInstance.delete(`/access-control/${accessControlId}`);
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
): Promise<UpdateAccessControlResponse> => {
  try {
    const response = await axiosInstance.put(`/access-control/${accessControlId}`, data);
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
export const getAllCustomField = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/custom-field`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const getCustomFieldById = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/custom-field/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const getAllCustomFieldPagination = async (
  start: number,
  length: number,
  sortDir: string,
  keyword?: string,
): Promise<GetAllCustomFieldPaginationResponse> => {
  try {
    const response = await axiosInstance.get(`/custom-field/dt`, {
      params: {
        start,
        length,
        'search[value]': keyword,
        sort_dir: sortDir,
      },
      headers: { Accept: 'application/json' },
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
): Promise<CreateCustomFieldResponse> => {
  try {
    const response = await axiosInstance.post(`/custom-field`, data);
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
  data: UpdateCustomFieldRequest,
  customFieldId: string,
): Promise<UpdateCustomFieldResponse> => {
  try {
    const response = await axiosInstance.put(`/custom-field/${customFieldId}`, data);
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
): Promise<DeleteVisitorTypeResponse> => {
  const response = await axiosInstance.delete(`/custom-field/${customFieldId}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

//#endregion

//#region Setting Smtp

export const getAllSmtp = async (): Promise<GetAllSettingSmtpResponse> => {
  try {
    const response = await axiosInstance.get(`/setting-smtp`, {
      headers: { Accept: 'application/json' },
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
  start: number,
  length: number,
  sortColumn: string,
  keyword?: string,
): Promise<GetAllSettingSmtpPaginationResponse> => {
  try {
    const response = await axiosInstance.get(`/setting-smtp/dt`, {
      params: { start, length, sort_column: sortColumn, 'search[value]': keyword },
      headers: { Accept: 'application/json' },
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
): Promise<CreateSettingSmtpResponse> => {
  try {
    const response = await axiosInstance.post(`/setting-smtp`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const updateSmtp = async (
  data: UpdateSettingSmtpRequest,
  smtpId: string,
): Promise<UpdateSettingSmtpResponse> => {
  try {
    const response = await axiosInstance.put(`/setting-smtp/${smtpId}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const deleteSmtp = async (smtpId: string): Promise<DeleteVisitorTypeResponse> => {
  const response = await axiosInstance.delete(`/setting-smtp/${smtpId}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const createEmail = async (data: CreateEmailRequest): Promise<CreateEmailResponse> => {
  try {
    const response = await axiosInstance.post(`/email/test-email`, data);
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
export const getAllIntegration = async (): Promise<GetAllIntegrationResponse> => {
  try {
    const response = await axiosInstance.get(`/integration`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const getAvailableIntegration = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/integration/available`, {
      headers: { Accept: 'application/json' },
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
): Promise<GetIntegrationByIdResponse> => {
  try {
    const response = await axiosInstance.get(`/integration/${id}`, {
      headers: { Accept: 'application/json' },
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
): Promise<CreateIntegrationResponse> => {
  try {
    const response = await axiosInstance.post(`/integration`, data);
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

export const syncHoneywellIntegration = async (integrationId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axiosInstance.post(
      `/integration-honeywell/sync/${integrationId}`,
      {}, // pakai {} biar nggak trigger edge-case body null
    );
    return data as ApiResponse;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const d = (error.response.data || {}) as Partial<ApiResponse>;
      return {
        status: d.status ?? 'fail',
        status_code: d.status_code ?? error.response.status,
        title: d.title ?? 'fail',
        msg: d.msg ?? 'Request failed',
        collection: d.collection ?? null,
      };
    }
    throw error;
  }
};

export const syncHoneywellBadge = async (integrationId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axiosInstance.post(
      `/integration-honeywell/sync/${integrationId}/badges`,
      {},
    );
    return data as ApiResponse;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const d = (error.response.data || {}) as Partial<ApiResponse>;
      return {
        status: d.status ?? 'fail',
        status_code: d.status_code ?? error.response.status,
        title: d.title ?? 'fail',
        msg: d.msg ?? 'Request failed',
        collection: d.collection ?? null,
      };
    }
    throw error;
  }
};

// import badge
export const addBadgeEmployee = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/integration-honeywell/import/${id}/badges`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const syncTrackingBleIntegration = async (integrationId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axiosInstance.post(
      `/integration-trackingble/sync/${integrationId}`,
      {}, // pakai {} biar nggak trigger edge-case body null
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
    throw error;
  }
};

export const deleteIntegration = async (
  integrationId: string,
): Promise<DeleteIntegrationResponse> => {
  try {
    const response = await axiosInstance.delete(`/integration/${integrationId}`);
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
): Promise<UpdateIntegrationResponse> => {
  try {
    const response = await axiosInstance.put(`/integration/${integrationId}`, data);
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
export const getCompanies = async (integrationId: string): Promise<GetCompaniesResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-honeywell/company/${integrationId}`);
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
): Promise<GetCompaniesResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-honeywell/company/${integrationId}/${id}`,
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
): Promise<UpdateCompaniesResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-honeywell/company/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

// get badge type
export const getBadgeType = async (integrationId: string): Promise<GetBadgeTypeResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-honeywell/badge-type/${integrationId}`);
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
): Promise<GetBadgeTypeResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-honeywell/badge-type/${integrationId}/${id}`,
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
): Promise<UpdateBadgeTypeResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-honeywell/badge-type/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

// get badge status
export const getBadgeStatus = async (integrationId: string): Promise<GetBadgeStatusResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-honeywell/badge-status/${integrationId}`,
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
): Promise<GetBadgeStatusResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-honeywell/badge-status/${integrationId}/${id}`,
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
export const getClearcodes = async (integrationId: string): Promise<GetClearCodesResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-honeywell/clearcodes/${integrationId}`);
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
): Promise<GetClearCodesResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-honeywell/clearcodes/${integrationId}/${id}`,
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
): Promise<UpdateClearcodesResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-honeywell/clearcodes/${id}`, data);
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
): Promise<GetOrganizationTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/organization/${integrationId}`,
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
): Promise<GetOrganizationTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/organization/${integrationId}/${id}`,
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
): Promise<UpdateOrganizationTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/organization/${id}`, data);
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
): Promise<GetDepartmentTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/department/${integrationId}`,
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
): Promise<GetDepartmentTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/department/${integrationId}/${id}`,
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
): Promise<UpdateDepartmentTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/department/${id}`, data);
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
): Promise<GetDistrictTrackingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-trackingble/district/${integrationId}`);
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
): Promise<GetDistrictTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/district/${integrationId}/${id}`,
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
): Promise<UpdateDistrictTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/district/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

// Card
export const getCardTracking = async (integrationId: string): Promise<GetCardTrackingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-trackingble/card/${integrationId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const getCardAccessTracking = async (integrationId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/card-access/${integrationId}`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const getCardAccessTrackingById = async (
  integrationId: string,
  id: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/card-access/${integrationId}/${id}`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const updateCardAccessTracking = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/card-access/${id}`, data);
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
): Promise<GetCardTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/card/${integrationId}/${id}`,
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
): Promise<UpdateCardTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/card/${id}`, data);
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
): Promise<GetAlarmTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/alarm-record-tracking/${integrationId}`,
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
): Promise<GetAlarmTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/alarm-record-tracking/${integrationId}/${id}`,
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
): Promise<UpdateAlarmTrackingResponse> => {
  try {
    const response = await axiosInstance.put(
      `/integration-trackingble/alarm-record-tracking/${id}`,
      data,
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
): Promise<GetFloorPlanMaskedAreaTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/floorplan-masked-area/${integrationId}/${id}`,
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
): Promise<UpdateFloorPlanMaskedAreaTrackingResponse> => {
  try {
    const response = await axiosInstance.put(
      `/integration-trackingble/floorplan-masked-area/${id}`,
      data,
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

export const getFloor = async (integrationId: string): Promise<GetFloorTrackingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-trackingble/floor/${integrationId}`);
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
): Promise<GetFloorTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/floor/${integrationId}/${id}`,
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
): Promise<UpdateFloorTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/floor/${id}`, data);
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
): Promise<GetFloorPlanTrackingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-trackingble/floorplan/${integrationId}`);
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
): Promise<GetFloorPlanTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/floorplan/${integrationId}/${id}`,
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
): Promise<UpdateFloorPlanTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/floorplan/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

// Access CCTV

export const getAccessCCTV = async (integrationId: string): Promise<GetCctvTrackingResponse> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/access-cctv/${integrationId}`,
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
): Promise<GetCctvTrackingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-trackingble/access-cctv/${integrationId}/${id}`,
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
): Promise<UpdateCctvTrackingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-trackingble/access-cctv/${id}`, data);
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

export const getIntegrationIpsotekCategory = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/integration-ipsotek/category`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

// get by id

export const getIntegrationIpsotekCategoryById = async (integrationId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/integration-ipsotek/category/${integrationId}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const getIntegrationIpsotekById = async (
  integrationId: string,
  id: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `/integration-ipsotek/category/${integrationId}/${id}`,
      {
        headers: { Accept: 'application/json' },
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

export const createIpsotekCategory = async (data: any, id: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/integration-ipsotek/category/${id}`, data, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const updateIpsotekCategory = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/integration-ipsotek/category/${id}`, data, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

export const deleteIpsotekCategory = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/integration-ipsotek/category/${id}`, {
      headers: { Accept: 'application/json' },
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
