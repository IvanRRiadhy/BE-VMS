import axios from 'axios';
import axiosInstance from '../../interceptor';

export const getVisitorTypeAnalytics = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/visitor-type-analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// get by id
export const getVisitorTypeAnalyticsById = async (id: string, token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/visitor-type-analytics/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// get visitor by id
export const getVisitorTypeAnalyticsByVisitorId = async (
  id: string,
  token: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/visitor-type-analytics/visitor-type/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// create
export const createVisitorTypeAnalytics = async (data: any, token: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/visitor-type-analytics`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// create bulk
export const createVisitorTypeAnalyticsBulk = async (data: any, token: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/visitor-type-analytics/bulk`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// update
export const updateVisitorTypeAnalytics = async (
  id: string,
  data: any,
  token: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/visitor-type-analytics/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Delete
export const deleteVisitorTypeAnalytics = async (id: string, token: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/visitor-type-analytics/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Delete bulk
export const deleteVisitorTypeAnalyticsBulk = async (id: string, token: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/visitor-type-analytics/bulk/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
