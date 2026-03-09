import axiosInstance from '../interceptor';

export const getPublicSite = async (
  token: string,
  tokens: string,
  dataType: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-site/public', {
      headers: { Authorization: `Bearer ${token}` },
      params: { token: tokens, 'data-type': dataType },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getPublicAccessControl = async (
  token: string,
  tokens: string,
  dataType: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-ac/public', {
      headers: { Authorization: `Bearer ${token}` },
      params: { token: tokens, 'data-type': dataType },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getPublicVisitorType = async (
  token: string,
  tokens: string,
  dataType: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor-type/public', {
      headers: { Authorization: `Bearer ${token}` },
      params: { token: tokens, 'data-type': dataType },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getPublicVisitorTypeById = async (
  token: string,
  tokens: string,
  dataType: string,
  entityId: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor-type/public', {
      headers: { Authorization: `Bearer ${token}` },
      params: { token: tokens, 'data-type': dataType, 'entity-id': entityId },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getPublicVisitor = async (
  token: string,
  tokens: string,
  dataType: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor/public', {
      headers: { Authorization: `Bearer ${token}` },
      params: { token: tokens, 'data-type': dataType },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getPublicVisitorEmployee = async (
  token: string,
  tokens: string,
  dataType: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor/public/employee', {
      headers: { Authorization: `Bearer ${token}` },
      params: { token: tokens, 'data-type': dataType },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getPublicVisitorHost = async (
  token: string,
  tokens: string,
  dataType: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor/public/host', {
      headers: { Authorization: `Bearer ${token}` },
      params: { token: tokens, 'data-type': dataType },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const createSubmitShareLink = async (
  token: string,
  tokens: string,
  timestamp: string,
  data: any,
): Promise<any> => {
  try {
    const response = await axiosInstance.post('/on-portal/submit/invitation-link', data, {
      headers: { Authorization: `Bearer ${token}` },
      params: { token: tokens, timestamp },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const createSubmitGroupShareLink = async (
  token: string,
  tokens: string,
  timestamp: string,
  data: any,
): Promise<any> => {
  try {
    const response = await axiosInstance.post('/on-portal/submit/bulk/invitation-link', data, {
      headers: { Authorization: `Bearer ${token}` },
      params: { token: tokens, timestamp },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
