// get menu

import axiosInstance from '../../interceptor';

export const getMenu = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/menu', {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
