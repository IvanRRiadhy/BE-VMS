import axiosInstance from '../../interceptor';

export const getVisitorDocuments = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/swap-card/visitor-documents/${id}`);
  return response.data;
};

// post
export const swapCard = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/swap-card', data);
  return response.data;
};

export const returnCard = async (data: any): Promise<any> => {
  const response = await axiosInstance.put('/operator-invitation/return-access-card', data);
  return response.data;
};

export const getRegisteredSiteOperator = async (): Promise<any> => {
  const response = await axiosInstance.get(`/operator-invitation/registered-site`);
  return response.data;
};

export const getSiteAccessOperator = async (): Promise<any> => {
  const response = await axiosInstance.get(`/operator-invitation/site-access`);
  return response.data;
};
