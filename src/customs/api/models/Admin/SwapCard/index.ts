import axiosInstance from '../../../interceptor';

export const getVisitorDocuments = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.get(`/swap-card/visitor-documents/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// post
export const swapCard = async (token: string, data: any): Promise<any> => {
  const response = await axiosInstance.post('/swap-card', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const returnCard = async (token: string, data: any): Promise<any> => {
  const response = await axiosInstance.put('/operator-invitation/return-access-card', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getRegisteredSiteOperator = async (token: string): Promise<any> => {
  const response = await axiosInstance.get(`/operator-invitation/registered-site`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getSiteAccessOperator = async (token: string): Promise<any> => {
  const response = await axiosInstance.get(`/operator-invitation/site-access`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};