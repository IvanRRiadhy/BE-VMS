import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `https://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosInstance2 = axios.create({
  baseURL: `https://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

let clearTokenCallback: (() => void) | null = null;

export const setClearTokenCallback = (callback: () => void) => {
  clearTokenCallback = callback;
};

const responseInterceptor = (response: any) => response;
const errorInterceptor = (error: any) => {
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
};

// Pasang interceptor ke kedua instance
axiosInstance.interceptors.response.use(responseInterceptor, errorInterceptor);
axiosInstance2.interceptors.response.use(responseInterceptor, errorInterceptor);

// Export kedua instance
export default axiosInstance;
export { axiosInstance2 };
