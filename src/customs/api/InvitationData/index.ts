import axiosInstance from '../interceptor';

export const getInvitationSite = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-site', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getInvitationAccessControl = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-ac', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getInvitationVisitorType = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor-type', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getInvitationVisitor = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getInvitationVisitorEmployee = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor/employee', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getInvitationVisitorHost = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor/host', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};
