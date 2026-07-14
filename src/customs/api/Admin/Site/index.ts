import axiosInstance from '../../interceptor';

export const updateSiteActive = async (id: string, active: boolean) => {
  const response = await axiosInstance.put(`/site/${id}/active/${active}`, {});
  return response.data;
};
