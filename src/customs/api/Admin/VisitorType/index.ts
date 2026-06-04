import axiosInstance from '../../interceptor';

export const updateVisitorTypeActive = async (token: string, id: string, active: boolean) => {
  const response = await axiosInstance.put(
    `/visitor-type/${id}/enable/${active}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

export const updateQuickVisitorType = async (token: string, id: string, active: boolean) => {
  const response = await axiosInstance.put(
    `/visitor-type/${id}/quick-access/${active}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};
