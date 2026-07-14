import axiosInstance from '../../interceptor';

export const getAccountTracking = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/user/${id}/trackingble/account`);
  return response.data;
};

// Assign Account
export const assignAccount = async (id: string, data: any): Promise<any> => {
  const response = await axiosInstance.post(`/user/${id}/trackingble/assign`, data);
  return response.data;
};

export const assignEmployee = async (id: string, data: any): Promise<any> => {
  const response = await axiosInstance.post(`/user/${id}/employee/assign`, data);
  return response.data;
};

// unassign
export const unassignAccount = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user/${id}/employee/unassign`);
  return response.data;
};

// get
export const getLinkAccountTracking = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/user/${id}/trackingble/account`);
  return response.data;
};

// create
export const createLinkAccountTracking = async (id: string, data: any): Promise<any> => {
  const response = await axiosInstance.post(`/user/${id}/trackingble/assign`, data);
  return response.data;
};
