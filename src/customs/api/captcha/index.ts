import axiosInstance from '../interceptor';

export const getCaptcha = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/captcha/generate');
    return response.data;
  } catch (error) {
    throw error;
  }
};
