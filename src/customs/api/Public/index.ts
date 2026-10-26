import axiosInstance from '../interceptor';

export const getPublicSite = async (
  tokens: string,
  dataType: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-site/public', {

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
  tokens: string,
  dataType: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-ac/public', {
   
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
  tokens: string,
  dataType: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor-type/public', {
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
  tokens: string,
  dataType: string,
  entityId: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor-type/public', {

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
  tokens: string,
  dataType: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor/public', {
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
  tokens: string,
  dataType: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor/public/employee', {
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
  tokens: string,
  dataType: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor/public/host', {
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
  tokens: string,
  timestamp: string,
  data: any,
): Promise<any> => {
  try {
    const response = await axiosInstance.post('/on-portal/submit/invitation-link', data, {
      params: { token: tokens, timestamp },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const createSubmitGroupShareLink = async (
  tokens: string,
  timestamp: string,
  data: any,
): Promise<any> => {
  try {
    const response = await axiosInstance.post('/on-portal/submit/bulk/invitation-link', data, {
      params: { token: tokens, timestamp },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// get inviation site drop point
export const getInvitationSiteDropPoint = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-site/drop-point');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// get visitor provider
export const getVisitorProvider = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/invitation-visitor-provider');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
