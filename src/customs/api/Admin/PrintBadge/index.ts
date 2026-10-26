import axiosInstance, { axiosInstance2 } from 'src/customs/api/interceptor';

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


export const uploadPrintBadgeLogo = async (
  id: string,
  file: File
): Promise<string | null> => {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await axiosInstance2.post(
    `/api/print-badge/upload/${id}`,
    formData,
    {
      headers: {
        'Content-Type': undefined,
      },
      transformRequest: [(data) => data],
    }
  );

  const fileUrl = response.data?.collection?.file_url;

  if (!fileUrl) return null;

  return fileUrl.startsWith('//') ? `https:${fileUrl}` : fileUrl;
};