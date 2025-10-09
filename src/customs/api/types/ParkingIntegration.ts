import axios from 'axios';
import axiosInstance from '../interceptor';
import { ValidationErrorResponse } from '../models/Department';
import {
  GetAreaParkingResponse,
  GetAreaParkingResponseById,
  GetBlockParkingResponse,
  GetBlockParkingResponseById,
  GetSlotParkingResponse,
  GetSlotParkingResponseById,
  GetVehicleParkingResponse,
  GetVehicleParkingResponseById,
  GetVisitorTypeParkingResponse,
  GetVisitorTypeParkingResponseById,
  UpdateAreaParkingRequest,
  UpdateAreaParkingResponse,
  UpdateBlockParkingRequest,
  UpdateBlockParkingResponse,
  UpdateSlotParkingRequest,
  UpdateSlotParkingResponse,
  UpdateVehicleParkingRequest,
  UpdateVehicleParkingResponse,
  UpdateVisitorTypeParkingRequest,
  UpdateVisitorTypeParkingResponse,
} from '../models/Integration/Parking';

type ApiResponse = {
  status: 'success' | 'fail' | 'not_found' | string;
  status_code: number;
  title?: string;
  msg?: string;
  collection?: any;
};

export const syncParkingIntegration = async (
  integrationId: string,
  token: string,
): Promise<ApiResponse> => {
  console.log('🔄 [SYNC] Start syncing parking integration...');
  console.log('➡️ Integration ID:', integrationId);
  console.log('🔑 Token:', token ? '✅ ada token' : '❌ token kosong');
  console.log('🌐 URL:', `/integration-parking/sync/${integrationId}`);

  try {
    const { data, status } = await axiosInstance.post(
      `/integration-parking/sync/${integrationId}`,
      {}, // body kosong
      {
        headers: { Authorization: `Bearer ${token}` },
        // timeout: 60000, // optional: biar gak nunggu selamanya
      },
    );

    console.log('✅ [SYNC] Success:', status, data);
    return data as ApiResponse;
  } catch (error: any) {
    console.group('❌ [SYNC] Error detail');
    console.error('Type:', error.constructor?.name);
    console.error('Message:', error.message);

    if (axios.isAxiosError(error)) {
      console.error('Config:', error.config?.url);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      console.error('Response data:', error.response?.data);
    }

    console.groupEnd();

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

    // error non-HTTP (timeout, jaringan, dll)
    throw error;
  }
};

export const getVisitorTypeParking = async (
  integrationId: string,
  token: string,
): Promise<GetVisitorTypeParkingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/visitor-type/${integrationId}`, {
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

export const getVisitorTypeParkingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetVisitorTypeParkingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-parking/visitor-type/${integrationId}/${id}`,
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

export const updateVisitorTypeParking = async (
  id: string,
  data: UpdateVisitorTypeParkingRequest,
  token: string,
): Promise<UpdateVisitorTypeParkingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-parking/visitor-type/${id}`, data, {
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

export const getBlockParking = async (
  integrationId: string,
  token: string,
): Promise<GetBlockParkingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/block/${integrationId}`, {
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

export const getBlockParkingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetBlockParkingResponseById> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/block/${integrationId}/${id}`, {
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

export const updateBlockParking = async (
  id: string,
  data: UpdateBlockParkingRequest,
  token: string,
): Promise<UpdateBlockParkingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-parking/block/${id}`, data, {
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

export const getAreaParking = async (
  integrationId: string,
  token: string,
): Promise<GetAreaParkingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/area/${integrationId}`, {
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

export const getAreaParkingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetAreaParkingResponseById> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/area/${integrationId}/${id}`, {
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

export const updateAreaParking = async (
  id: string,
  data: UpdateAreaParkingRequest,
  token: string,
): Promise<UpdateAreaParkingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-parking/area/${id}`, data, {
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

export const getSlotParking = async (
  integrationId: string,
  token: string,
): Promise<GetSlotParkingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/slot/${integrationId}`, {
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

export const getSlotParkingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetSlotParkingResponseById> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/slot/${integrationId}/${id}`, {
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

export const updateSlotParking = async (
  id: string,
  data: UpdateSlotParkingRequest,
  token: string,
): Promise<UpdateSlotParkingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-parking/slot/${id}`, data, {
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

export const getVehicleParking = async (
  integrationId: string,
  token: string,
): Promise<GetVehicleParkingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/vehicle/${integrationId}`, {
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

export const getVehicleParkingById = async (
  integrationId: string,
  id: string,
  token: string,
): Promise<GetVehicleParkingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-parking/vehicle/${integrationId}/${id}`,
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

export const updateVehicleParking = async (
  id: string,
  data: UpdateVehicleParkingRequest,
  token: string,
): Promise<UpdateVehicleParkingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-parking/vehicle/${id}`, data, {
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
