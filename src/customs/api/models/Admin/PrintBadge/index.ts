import axiosInstance from 'src/customs/api/interceptor';

export const getPrintBadgeConfig = async (token: string): Promise<any> => {
  const response = await axiosInstance.get('/print-badge/config', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Update
export const updatePrintBadgeConfig = async (
  id: string,
  data: any,
  token: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/print-badge/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
