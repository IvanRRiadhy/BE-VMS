import axiosInstance from '../../interceptor';

export const createQuickAccess = async (token: string | null, data: any): Promise<any> => {
  const response = await axiosInstance.post('/visitor/quick/new-visit', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
