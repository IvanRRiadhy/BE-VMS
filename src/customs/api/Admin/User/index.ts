import axiosInstance from '../../interceptor';

export const getAccountTracking = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/user/${id}/trackingble/account`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Assign Account
export const assignAccount = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/user/${id}/trackingble/assign`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const assignEmployee = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/user/${id}/employee/assign`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// unassign
export const unassignAccount = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user/${id}/employee/unassign`);
  return response.data;
};

// get
export const getLinkAccountTracking = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/user/${id}/trackingble/account`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// create
export const createLinkAccountTracking = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/user/${id}/trackingble/assign`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLinkAccountParking = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/user/${id}/parking/account`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// create
export const createLinkAccountParking = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/user/${id}/parking/assign`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get roles
export const getUserRoles = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/user/roles');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// SSO
export const getSSO = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/user/sso/linked');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// switch-account
export const switchAccount = async (): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/user/sso/switch-account`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// sso auth
export const ssoAuth = async (
  data: any,
  integrationId: string,
  userLinkedId: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `/user/sso/system/${integrationId}/linked/${userLinkedId}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
