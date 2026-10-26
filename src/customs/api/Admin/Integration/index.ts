import { createIntegration } from './../../admin';
import axiosInstance from '../../interceptor';

export const checkConnection = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/integration-honeywell/check-connection/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Event Subscription
export const getIntegrationEventInstanceTab = async () => {
  try {
    const response = await axiosInstance.get(`/integration/event-instance/list-tab`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getIntegrationInstanceByIntegrationId = async (integrationId: string) => {
  try {
    const response = await axiosInstance.get(
      `/integration/event-instance/integration-list/${integrationId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getIntegrationEventInstance = async () => {
  try {
    const response = await axiosInstance.get(`/integration/event-instance`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createIntegrationEventInstance = async (data: any) => {
  try {
    const response = await axiosInstance.post(`/integration/event-instance`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateIntegrationEventInstance = async (id: string, data: any) => {
  try {
    const response = await axiosInstance.put(`/integration/event-instance/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteIntegrationEventInstance = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/integration/event-instance/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSourceIpsotek = async (integrationId: string) => {
  try {
    const response = await axiosInstance.get(
      `/integration/event-instance/source/${integrationId}/ipsotek`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get source Honeywell
export const getSourceHoneywell = async (integrationId: string) => {
  try {
    const response = await axiosInstance.get(
      `/integration/event-instance/source/${integrationId}/honeywell`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get source parking
export const getSourceParking = async (integrationId: string) => {
  try {
    const response = await axiosInstance.get(
      `/integration/event-instance/source/${integrationId}/parking`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get source tracking-ble
export const getSourceTrackingBle = async (integrationId: string) => {
  try {
    const response = await axiosInstance.get(
      `/integration/event-instance/source/${integrationId}/tracking-ble`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
