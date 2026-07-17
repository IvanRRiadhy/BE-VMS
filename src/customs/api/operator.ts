import { start } from 'repl';
import axios from 'axios';
import axiosInstance from './interceptor';
import {
  CreateInvitationActionOperatorRequest,
  CreateMultipleInvitationOperatorRequest,
  GetInvitationCodeResponse,
} from './models/Operator/Invitation';
import {
  CreateGroupVisitorRequest,
  CreateVisitorRequest,
  CreateVisitorResponse,
} from './models/Admin/Visitor';
import { GetAllGrantAccessResponse } from './models/Admin/GrantAccess';

export const getInvitationCode = async (code: string): Promise<GetInvitationCodeResponse> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/search', {
      headers: { Accept: 'application/json' },
      params: { code },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const searchVisitor = async (params: {
  code?: string;
  name?: string;
  vehicle_plate_number?: string;
}): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/search-operator-view', {
      headers: { Accept: 'application/json' },
      params,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getInvitationScheduleOperator = async (
  start_date?: string,
  end_date?: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/invitation-onschedule', {
      headers: { Accept: 'application/json' },
      params: { 'start-date': start_date, 'end-date': end_date },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getOperatorHistory = async (
  start_date?: string,
  end_date?: string,
  site_id?: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/history', {
      headers: { Accept: 'application/json' },
      params: { 'start-date': start_date, 'end-date': end_date, 'site-id': site_id },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getInvitationScheduleOperatoryId = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/operator-invitation/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getInvitationOperatorRelated = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `/operator-invitation/invitation-related-visitor/${id}`,
      {
        headers: { Accept: 'application/json' },
      },
    );
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getActiveInvitation = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/active-invitation', {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const createInvitationActionOperator = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/operator-invitation/action/${id}`, data, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const createMultipleInvitationActionOperator = async (
  data: CreateMultipleInvitationOperatorRequest,
): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/operator-invitation/multiple-action`, data, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getAvailableCardOperator = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/available-cards', {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const createGiveAccessOperator = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/operator-invitation/checkin-give-access', data, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getGrantAccessOperator = async (site: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/grant-access-card', {
      headers: { Accept: 'application/json' },
      params: { site },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const createGrandAccessOperator = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/operator-invitation/grant-access-card', data, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getPermissionOperator = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/permission-access', {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const createMultipleGrantAccess = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      '/operator-invitation/grant-access-card-multiple',
      data,
      {
        headers: { Accept: 'application/json' },
      },
    );
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const createSubmitCompletePra = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put('/operator-invitation/submit-complete-pra', data, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createSubmitCompletePraMultiple = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put(
      '/operator-invitation/submit-complete-pra-multiple',
      data,
      {
        headers: { Accept: 'application/json' },
      },
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const extendPeriodOperator = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put('/operator-invitation/extend-period', data, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createSingleInvitationOperator = async (
  data: CreateVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/operator-invitation/new-visit', data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const createVisitorsGroupOperator = async (
  data: CreateGroupVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/operator-invitation/new-visit-group', data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

// Pra Register
export const createSinglePraRegisterOperator = async (
  data: CreateVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/operator-invitation/new-pra-invite', data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const createPraRegisterGroupOperator = async (
  data: CreateGroupVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/operator-invitation/new-pra-invite-group', data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getGrantAccess = async (site: string): Promise<GetAllGrantAccessResponse> => {
  const params = {
    site,
  };
  const response = await axiosInstance.get('/visitor/grant-access-card', {
    headers: { Accept: 'application/json' },
    params,
  });
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data;
};

export const getTodayVisitingPurpose = async (): Promise<any> => {
  const response = await axiosInstance.get('/dashboard/top-today-visiting-purpose', {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getOperatorBlacklist = async (
  start: number,
  sortDir: string,
  length: number,
  keyword: string = '',
  startDate?: string,
  endDate?: string,
  status?: string | boolean,
  visitor?: string,
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

  const response = await axiosInstance.get('/operator-invitation/blacklist/dt', {
    headers: { Accept: 'application/json' },
    params,
  });
  return response.data;
};

export const getOperatorBlacklistById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get('/operator-invitation/blacklist/' + id, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const createOperatorBlacklist = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/operator-invitation/blacklist', data, {
    headers: { Accept: 'application/json' },
  });
  return response.data;
};

export const getUpComingVisitors = async (params?: {
  today?: string;
  start_date?: string;
  end_date?: string;
  visitor_type?: string;
  all_visitor_type?: string;
  start?: number;
  length?: number;
  sortDir?: string;
}): Promise<any> => {
  const response = await axiosInstance.get('/operator-invitation/upcoming-visitor', {
    headers: {
      Accept: 'application/json',
    },
    params: {
      today: params?.today,
      'start-date': params?.start_date,
      'end-date': params?.end_date,
      'visitor-type': params?.visitor_type,
      'all-visitor-type': params?.all_visitor_type,
      start: params?.start,
      length: params?.length,
      'sort_dir': params?.sortDir,
    },
  });

  return response.data;
};

export const getUpComingPurpose = async (params?: {
  today?: string;
  start_date?: string;
  end_date?: string;
  visitor_type?: string;
  all_visitor_type?: string;
}): Promise<any> => {
  const response = await axiosInstance.get('/operator-invitation/upcoming-purpose', {
    headers: {
      Accept: 'application/json',
    },
    params: {
      today: params?.today,
      'start-date': params?.start_date,
      'end-date': params?.end_date,
      'visitor-type': params?.visitor_type,
      'all-visitor-type': params?.all_visitor_type,
    },
  });

  return response.data;
};
