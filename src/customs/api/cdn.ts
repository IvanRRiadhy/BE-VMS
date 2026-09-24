import { axiosInstance2 } from './interceptor';

export interface UploadCdnResponse {
  collection?: {
    file_url?: string;
  };
}

export const uploadFileToCDN = async (
  file: File | Blob,
  path = 'visitor',
): Promise<string | null> => {
  const formData = new FormData();

  const filename = file instanceof File && file.name ? file.name : 'selfie.png';

  formData.append('file_name', filename);
  formData.append('file', file, filename);
  formData.append('path', path);

  try {
    const response = await axiosInstance2.post<UploadCdnResponse>('/cdn/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const fileUrl = response.data?.collection?.file_url;

    if (!fileUrl) {
      return null;
    }

    return fileUrl.startsWith('//') ? `http:${fileUrl}` : fileUrl;
  } catch (error) {
    console.error('Upload CDN failed:', error);
    return null;
  }
};
