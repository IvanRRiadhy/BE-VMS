import axios from 'axios';
import axiosInstance from '../../interceptor';

export const getVisitorTypeAccess = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/visitor-type-access`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// get by id
export const getVisitorTypeAccessById = async (id: string, token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/visitor-type-access/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// get visitor by id
export const getVisitorTypeAccessByVisitorId = async (id: string, token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/visitor-type-access/visitor-type/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// create
export const createVisitorTypeAccess = async (data: any, token: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/visitor-type-access`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// create bulk
export const createVisitorTypeAccessBulk = async (data: any, token: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/visitor-type-access/bulk`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// update
export const updateVisitorTypeAccess = async (
  id: string,
  data: any,
  token: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/visitor-type-access/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Delete
export const deleteVisitorTypeAccess = async (id: string, token: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/visitor-type-access/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
   console.error('Error fetching data:', error);
    throw error;
  }
};

// Delete bulk
export const deleteVisitorTypeAccessBulk = async (id: string, token: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/visitor-type-access/bulk/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
