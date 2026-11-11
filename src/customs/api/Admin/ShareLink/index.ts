import axiosInstance from '../../interceptor';

export const getShareLink = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/visitor-share-link');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

// get by id
export const getShareLinkById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/visitor-share-link/${id}`);
  return response.data;
};

// get by dt
export const getShareLinkByDt = async (
  start: number,
  length: number,
  keyword: string = '',
  sortDir: string,
): Promise<any> => {
  const response = await axiosInstance.get(`/visitor-share-link/dt`, {
    params: {
      start,
      length,
      // 'search[value]': keyword,
      ...(keyword && { 'search[value]': keyword }),
      sort_dir: sortDir,
      // 'start-date': startDate,
      // 'end-date': endDate,
    },
  });
  return response.data;
};

export const createShareLink = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/visitor-share-link/new', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// create by email
export const createShareLinkByEmail = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/visitor-share-link/new/send-email', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createShareLinkByEmailById = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/visitor-share-link/send-email/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete
export const deleteShareLink = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete('/visitor-share-link/' + id);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get detail visitor share link
export const getDetailShareLink = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/visitor-share-link/${id}/invited-visitor`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
