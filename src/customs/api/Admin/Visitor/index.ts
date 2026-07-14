import axiosInstance from '../../interceptor';

export const createQuickAccess = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/visitor/quick/new-visit', data);
  return response.data;
};
