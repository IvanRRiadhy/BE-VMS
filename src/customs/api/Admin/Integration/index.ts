import axiosInstance from '../../interceptor';

export const checkConnection = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.get(`/integration-honeywell/check-connection/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
