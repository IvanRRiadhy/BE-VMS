import axiosInstance from '../../interceptor';

export const getAccountTracking = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.get(`/user/${id}/trackingble/account`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Assign Account
export const assignAccount = async (token: string, id: string, data: any): Promise<any> => {
  const response = await axiosInstance.post(`/user/${id}/trackingble/assign`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const assignEmployee = async (token: string, id: string, data: any): Promise<any> => {
  const response = await axiosInstance.post(`/user/${id}/employee/assign`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// unassign
export const unassignAccount = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user/${id}/employee/unassign`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// get
export const getLinkAccountTracking = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.get(`/user/${id}/trackingble/account`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// create
export const createLinkAccountTracking = async (
  token: string,
  id: string,
  data: any,
): Promise<any> => {
  const response = await axiosInstance.post(`/user/${id}/trackingble/assign`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
