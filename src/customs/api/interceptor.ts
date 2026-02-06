import axios, { AxiosInstance } from 'axios';

import { getConfig } from 'src/config';

export let BASE_URL = '';

export const axiosInstance: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosInstance2: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

export function initializeAxiosBaseURL() {
  const config = getConfig();

  BASE_URL = config.API_BASE_URL;

  axiosInstance.defaults.baseURL = `${BASE_URL}/api`;
  axiosInstance2.defaults.baseURL = BASE_URL;
}

// export const BASE_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`;

// const axiosInstance = axios.create({
//   baseURL: `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api`,

//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// const axiosInstance2 = axios.create({
//   baseURL: `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

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
    // if (clearTokenCallback) {
    //   clearTokenCallback();
    // }
    // window.location.href = '/';
  }
  return Promise.reject(error);
};

// Pasang interceptor ke kedua instance
axiosInstance.interceptors.response.use(responseInterceptor, errorInterceptor);
axiosInstance2.interceptors.response.use(responseInterceptor, errorInterceptor);

export default axiosInstance;
// export { axiosInstance2 };
