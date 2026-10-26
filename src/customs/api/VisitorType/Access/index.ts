import axios from 'axios';
import axiosInstance from '../../interceptor';

export const getVisitorTypeAccess = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/visitor-type-access`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// get by id
export const getVisitorTypeAccessById = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/visitor-type-access/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// get visitor by id
export const getVisitorTypeAccessByVisitorId = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/visitor-type-access/visitor-type/${id}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return { collection: [] };
    }

    throw error;
  }
};

// create
export const createVisitorTypeAccess = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/visitor-type-access`, data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// create bulk
export const createVisitorTypeAccessBulk = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/visitor-type-access/bulk`, data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// update
export const updateVisitorTypeAccess = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/visitor-type-access/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Delete
export const deleteVisitorTypeAccess = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/visitor-type-access/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Delete bulk
export const deleteVisitorTypeAccessBulk = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/visitor-type-access/bulk/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
