import axiosInstance from '../interceptor';

export const getShareLink = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/visitor-share-link', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

// get by id
export const getShareLinkById = async (id: string, token: string): Promise<any> => {
  const response = await axiosInstance.get(`/visitor-share-link/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// get by dt
export const getShareLinkByDt = async (
  token: string,
  start: number,
  length: number,
  keyword: string = '',
  sortDir: string,
  startDate?: string,
  endDate?: string,
): Promise<any> => {
  const response = await axiosInstance.get(`visitor-share-link/dt`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      start,
      length,
      'search[value]': keyword,
      sort_dir: sortDir,
      // 'start-date': startDate,
      // 'end-date': endDate,
    },
  });
  return response.data;
};

export const createShareLink = async (token: string, data: any): Promise<any> => {
  const response = await axiosInstance.post('/visitor-share-link/new', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// create by email
export const createShareLinkByEmail = async (token: string, data: any): Promise<any> => {
  const response = await axiosInstance.post('/visitor-share-link/new/send-email', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createShareLinkByEmailById = async (
  token: string,
  data: any,
  id: string,
): Promise<any> => {
  const response = await axiosInstance.post(`/visitor-share-link/send-email/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Delete
export const deleteShareLink = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.delete('/visitor-share-link/' + id, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
