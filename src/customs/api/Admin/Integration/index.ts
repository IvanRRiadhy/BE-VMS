import axiosInstance from '../../interceptor';

export const checkConnection = async ( id: string): Promise<any> => {
  const response = await axiosInstance.get(`/integration-honeywell/check-connection/${id}`);
  return response.data;
};
