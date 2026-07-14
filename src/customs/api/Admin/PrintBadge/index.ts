import axiosInstance from 'src/customs/api/interceptor';

export const getPrintBadgeConfig = async (): Promise<any> => {
  const response = await axiosInstance.get('/print-badge/config');
  return response.data;
};

// Update
export const updatePrintBadgeConfig = async (
  id: string,
  data: any,
): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/print-badge/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
