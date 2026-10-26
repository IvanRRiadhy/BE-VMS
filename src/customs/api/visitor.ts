import axios from 'axios';
import axiosInstance from './interceptor';

// #region Invitation

export const getActiveInvitation = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation/active-invitation', {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getInvitation = async (
  start_date?: string,
  end_date?: string,
  is_praregister_done: boolean = false,
): Promise<any> => {
  const params: Record<string, string | boolean> = {};

  if (start_date) params['start-date'] = start_date;
  if (end_date) params['end-date'] = end_date;
  if (is_praregister_done !== undefined) params['is-praregister-done'] = is_praregister_done;

  try {
    const response = await axiosInstance.get('/invitation/invitation-onschedule', {
      headers: {
        Accept: 'application/json',
      },
      params,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getInvitations = async (
  start_date?: string,
  end_date?: string,
  // is_praregister_done: boolean = false,
): Promise<any> => {
  const params: Record<string, string | boolean> = {};

  if (start_date) params['start-date'] = start_date;
  if (end_date) params['end-date'] = end_date;
  // if (is_praregister_done !== undefined) params['is-praregister-done'] = is_praregister_done;

  try {
    const response = await axiosInstance.get('/invitation/invitation-onschedule', {
      headers: {
        Accept: 'application/json',
      },
      params,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export type GetInvitationResponse = {
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: {
    agenda: string;
    initial_trx_code: string;
    host: string;
    group_code: string;
    visitor_period_start: string;
    visitor_period_end: string;
    group_name: string;
    visitor_number: string;
    visitor_code: string;
    visitor_card: string | null;
    visitor_face: string | null;
    visitor_ble_card: string | null;
    invitation_code: string;
    meeting_code: string | null;
    self_only: boolean;
    checkin_at: string | null;
    checkout_at: string | null;
    deny_at: string | null;
    block_at: string | null;
    unblock_at: string | null;
    checkin_by: string | null;
    checkout_by: string | null;
    deny_by: string | null;
    deny_reason: string | null;
    block_by: string | null;
    block_reason: string | null;
    visitor_status: string;
    invitation_created_at: string;
    is_driving: boolean | null;
    vehicle_plate_number: string;
    vehicle_type: string;
    remarks: string | null;
    site_place: string;
    parking_id: string | null;
    visitor_id: string;
    identity_image: string;
    selfie_image: string;
    nda: string;
    can_track_ble: boolean | null;
    can_track_cctv: boolean | null;
    can_parking: boolean | null;
    can_access: boolean;
    can_meeting: boolean | null;
    tz: string;
    is_group: boolean;
    visitor_type: string;
    is_praregister_done: boolean;
    visitor: {
      visitor_type: string;
      identity_id: string;
      name: string;
      email: string;
      organization: string;
      gender: string;
      address: string | null;
      phone: string;
      is_vip: boolean | null;
      is_email_verified: boolean;
      email_verification_send_at: string | null;
      email_verification_token: string;
      visitor_period_start: string | null;
      visitor_period_end: string | null;
      is_employee: boolean;
      employee_id: string | null;
      employee: string | null;
      id: string;
    };
    application_id: string;
    extend_visitor_period: string | null;
    id: string;
  };
};

export const getInvitationById = async (id: string): Promise<GetInvitationResponse> => {
  try {
    const response = await axiosInstance.get(`/invitation/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getInvitationRelatedVisitor = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/invitation/invitation-related-visitor/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getHistory = async (
  start_date?: string,
  end_date?: string,
  site_id?: string,
): Promise<any> => {
  const params: Record<string, string> = {};

  if (start_date) params['start-date'] = start_date;
  if (end_date) params['end-date'] = end_date;
  if (site_id) params['site-id'] = site_id;

  try {
    const response = await axiosInstance.get('invitation/history', {
      headers: { Accept: 'application/json' },
      params,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getListSite = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/site', {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

//endregion

export const getOngoingInvitation = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation/ongoing-invitation', {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getDetailInvitationForm = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/invitation/detail-invitations-form/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const updateExtendPeriod = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/invitation/extend-period/${id}`, data, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const createVisitorInvitation = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/invitation/send-invitations/${id}`, data, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const openParkingBlocker = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/dashboard/parking/open-blocker', data, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const submitPraFormEmployee = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/invitation/submit/pra-form`, data, {
      headers: {
        Accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};
