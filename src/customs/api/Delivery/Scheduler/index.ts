import axios from 'axios';
import axiosInstance from 'src/customs/api/interceptor';

export const getAllSchedulerDelivery = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/delivery-schedule`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getSchedulerDeliveryById = async (token: string, id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/delivery-schedule/${id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getSchedulerDeliveryPagination = async (
  token: string,
  start: number,
  length: number,
  sortColumn?: string,
  sortDir?: string,
  keyword?: string,
  visitor_type_id?: string,
  host_id?: string,
  time_access_id?: string,
  site_id?: string,
): Promise<any> => {
  try {
    const params: Record<string, any> = {
      start,
      length,
    };
    // Tambahkan hanya kalau ada nilai
    if (sortColumn) params.sort_column = sortColumn;
    if (sortDir) params.sort_dir = sortDir;
    if (keyword) params['search[value]'] = keyword;
    if (visitor_type_id) params['visitor-type-id'] = visitor_type_id;
    if (host_id) params['host-id'] = host_id;
    if (time_access_id) params['time-access-id'] = time_access_id;
    if (site_id) params['site-id'] = site_id;

    const response = await axiosInstance.get(`/delivery-schedule/dt`, {
      params,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const createSchedulerDelivery = async (token: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/delivery-schedule`, data, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

// Update
export const updateSchedulerDelivery = async (
  token: string,
  id: string,
  data: any,
): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/delivery-schedule/${id}`, data, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const deleteSchedulerDelivery = async (token: string, id: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/delivery-schedule/${id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const createPrainvitationDelivery = async (token: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/delivery-schedule/new-invite', data, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};
export const getCalendarSchedule = async (
  token: string,
  deliveryScheduleId: string,
  startDate: string,
  endDate: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/delivery-schedule/calendar', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      params: {
        'delivery-schedule-id': deliveryScheduleId,
        'start-date': startDate,
        'end-date': endDate,
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

export const getDeliveryScheduleInvitationById = async (
  token: string,
  id: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/delivery-schedule/invitation' + `/${id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

export const updateReschduleInvitation = async (token: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put('/delivery-schedule/reschedule-invite', data, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};
