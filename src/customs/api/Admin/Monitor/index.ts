//Assembly Point

import axiosInstance from 'src/customs/api/interceptor';

export const getMonitorActivities = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/monitor/activities', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get hangfire-jobs
export const getHangfireJobs = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/hangfire/jobs', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get monitor integration events
export const getMonitorIntegrationEvents = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/monitor/integration-events', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get hangfire by id
export const getHangfireById = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/hangfire-jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get monitor summary
export const getMonitorSummary = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/monitor/summary');
    return response.data;
  } catch (error) {
    throw error;
  }
};
