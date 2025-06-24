import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://192.168.1.116:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let clearTokenCallback: (() => void) | null = null;

export const setClearTokenCallback = (callback: () => void) => {
  clearTokenCallback = callback;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      if (clearTokenCallback) {
        clearTokenCallback();
      }
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
