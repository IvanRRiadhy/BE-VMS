import axiosInstance from '../../interceptor';

export const updateVisitorTypeActive = async (id: string, active: boolean) => {
  const response = await axiosInstance.put(`/visitor-type/${id}/enable/${active}`, {});
  return response.data;
};

export const updateQuickVisitorType = async (id: string, active: boolean) => {
  const response = await axiosInstance.put(`/visitor-type/${id}/quick-access/${active}`, {});
  return response.data;
};
