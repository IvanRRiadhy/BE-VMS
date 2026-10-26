import axios from 'axios';
import axiosInstance from '../interceptor';
import { ValidationErrorResponse } from '../models/Admin/Department';
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
): Promise<ApiResponse> => {

  try {
    const { data, status } = await axiosInstance.post(
      `/integration-parking/sync/${integrationId}`,
      {}, // body kosong
    
    );

    console.log('✅ [SYNC] Success:', status, data);
    return data as ApiResponse;
  } catch (error: any) {
    // console.group('❌ [SYNC] Error detail');
    // console.error('Type:', error.constructor?.name);
    // console.error('Message:', error.message);

    // if (axios.isAxiosError(error)) {
    //   console.error('Config:', error.config?.url);
    //   console.error('Status:', error.response?.status);
    //   console.error('Headers:', error.response?.headers);
    //   console.error('Response data:', error.response?.data);
    // }

    // console.groupEnd();

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
): Promise<GetVisitorTypeParkingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/visitor-type/${integrationId}`);
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
): Promise<GetVisitorTypeParkingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-parking/visitor-type/${integrationId}/${id}`,
      {
        headers: {Accept: 'application/json' },
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
): Promise<UpdateVisitorTypeParkingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-parking/visitor-type/${id}`, data);
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
): Promise<GetBlockParkingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/block/${integrationId}`);
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
): Promise<GetBlockParkingResponseById> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/block/${integrationId}/${id}`);
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
): Promise<UpdateBlockParkingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-parking/block/${id}`, data);
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
): Promise<GetAreaParkingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/area/${integrationId}`);
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
): Promise<GetAreaParkingResponseById> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/area/${integrationId}/${id}`);
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
): Promise<UpdateAreaParkingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-parking/area/${id}`, data);
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
): Promise<GetSlotParkingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/slot/${integrationId}`);
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

): Promise<GetSlotParkingResponseById> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/slot/${integrationId}/${id}`, {
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

export const updateSlotParking = async (
  id: string,
  data: UpdateSlotParkingRequest,

): Promise<UpdateSlotParkingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-parking/slot/${id}`, data);
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
): Promise<GetVehicleParkingResponse> => {
  try {
    const response = await axiosInstance.get(`/integration-parking/vehicle/${integrationId}`);
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
): Promise<GetVehicleParkingResponseById> => {
  try {
    const response = await axiosInstance.get(
      `/integration-parking/vehicle/${integrationId}/${id}`,
      {
        headers: {Accept: 'application/json' },
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
): Promise<UpdateVehicleParkingResponse> => {
  try {
    const response = await axiosInstance.put(`/integration-parking/vehicle/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data as ValidationErrorResponse;
    }
    throw error;
  }
};

//#endregion
