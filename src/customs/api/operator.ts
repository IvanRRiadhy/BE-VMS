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

export const getInvitationCode = async (
  token: string,
  code: string,
): Promise<GetInvitationCodeResponse> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/search', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      params: { code },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const searchVisitor = async (
  token: string,
  params: {
    code?: string;
    name?: string;
    vehicle_plate_number?: string;
  },
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/search-operator-view', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      params,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getInvitationScheduleOperator = async (
  token: string,
  start_date?: string,
  end_date?: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/invitation-onschedule', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      params: { 'start-date': start_date, 'end-date': end_date },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getOperatorHistory = async (
  token: string,
  start_date?: string,
  end_date?: string,
  site_id?: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/history', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      params: { 'start-date': start_date, 'end-date': end_date, 'site-id': site_id },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getInvitationScheduleOperatoryId = async (id: string, token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/operator-invitation/${id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getInvitationOperatorRelated = async (id: string, token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `/operator-invitation/invitation-related-visitor/${id}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      },
    );
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getActiveInvitation = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/active-invitation', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const createInvitationActionOperator = async (
  token: string,
  id: string,
  data: CreateInvitationActionOperatorRequest,
): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/operator-invitation/action/${id}`, data, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const createMultipleInvitationActionOperator = async (
  token: string,
  data: CreateMultipleInvitationOperatorRequest,
): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/operator-invitation/multiple-action`, data, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getAvailableCardOperator = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/available-cards', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const createGiveAccessOperator = async (token: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/operator-invitation/checkin-give-access', data, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getGrantAccessOperator = async (token: string, site: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/grant-access-card', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      params: { site },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const createGrandAccessOperator = async (token: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/operator-invitation/grant-access-card', data, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const getPermissionOperator = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/operator-invitation/permission-access', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const createMultipleGrantAccess = async (token: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      '/operator-invitation/grant-access-card-multiple',
      data,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      },
    );
    return response.data;
  } catch (error) {
    // handle the error here
    return Promise.reject(error);
  }
};

export const createSubmitCompletePra = async (token: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put('/operator-invitation/submit-complete-pra', data, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createSubmitCompletePraMultiple = async (token: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put(
      '/operator-invitation/submit-complete-pra-multiple',
      data,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      },
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const extendPeriodOperator = async (token: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put('/operator-invitation/extend-period', data, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createSingleInvitationOperator = async (
  token: string,
  data: CreateVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/operator-invitation/new-visit', data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const createVisitorsGroupOperator = async (
  token: string,
  data: CreateGroupVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/operator-invitation/new-visit-group', data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

// Pra Register
export const createSinglePraRegisterOperator = async (
  token: string,
  data: CreateVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/operator-invitation/new-pra-invite', data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};

export const createPraRegisterGroupOperator = async (
  token: string,
  data: CreateGroupVisitorRequest,
): Promise<CreateVisitorResponse> => {
  const response = await axiosInstance.post('/operator-invitation/new-pra-invite-group', data, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return response.data;
};


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