import axiosInstance from '../../interceptor';

export const updateSiteActive = async (token: string, id: string, active: boolean) => {
  const response = await axiosInstance.put(
    `/site/${id}/active/${active}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};
