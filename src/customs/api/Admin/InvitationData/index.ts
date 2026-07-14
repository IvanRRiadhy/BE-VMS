import axiosInstance from 'src/customs/api/interceptor';

export const getInvitationSite = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-site');
    return response.data;
  } catch (error: any) {
    // if (error.response?.status === 404) {
    //   return { collection: [] };
    // }
    throw error;
  }
};

export const getInvitationAccessControl = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-ac');
    return response.data;
  } catch (error: any) {
    // if (error.response?.status === 404) {
    //   return { collection: [] };
    // }
    throw error;
  }
};

export const getInvitationVisitorType = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor-type');
    return response.data;
  } catch (error: any) {
    // if (error.response?.status === 404) {
    //   return { collection: [] };
    // }
    throw error;
  }
};

export const getInvitationVisitor = async (params?: {
  'search[value]'?: string;
  start?: number;
  length?: number;
}): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor', {
      params,
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getInvitationVisitorEmployee = async (params?: {
  'search[value]'?: string;
  start?: number;
  length?: number;
}): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor/employee', {
      params,
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getInvitationVisitorHost = async (params?: {
  'search[value]'?: string;
  start?: number;
  length?: number;
}): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor/host', {
      params,
    });
    return response.data;
  } catch (error: any) {
    // if (error.response?.status === 404) {
    //   return { collection: [] };
    // }
    throw error;
  }
};
