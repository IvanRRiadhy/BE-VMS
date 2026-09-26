import axios, { AxiosInstance } from 'axios';

import { getConfig } from 'src/config';

export let BASE_URL = '';

export const axiosInstance: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
});

export const axiosInstance2: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
});

export function initializeAxiosBaseURL() {
  const config = getConfig();

  BASE_URL = config.API_BASE_URL;

  axiosInstance.defaults.baseURL = `${BASE_URL}/api`;
  axiosInstance2.defaults.baseURL = BASE_URL;
}

let clearTokenCallback: (() => void) | null = null;

export const setClearTokenCallback = (callback: () => void) => {
  clearTokenCallback = callback;
};

let isHandling401 = false;

const responseInterceptor = (response: any) => response;
const errorInterceptor = (error: any) => {
  const status = error.response?.status;
  const method = error.config?.method?.toLowerCase();

  // 404 untuk GET dianggap sebagai data kosong
  if (status === 404 && method === 'get') {
    return Promise.resolve({
      ...error.response,
      data: {
        status: false,
        status_code: 404,
        title: 'Not Found',
        msg: 'Data not found',
        collection: [],
        RecordsTotal: 0,
        RecordsFiltered: 0,
        Draw: 0,
      },
    });
  }
  // if (
  //   axios.isAxiosError(error) &&
  //   (error.response?.status === 401 || error.response?.status === 403)
  // ) {
  //   // if (clearTokenCallback) {
  //   //   clearTokenCallback();
  //   // }
  //   // window.location.href = '/';
  //   //  if (error.response?.status === 401) {
  //   //    clearTokenCallback?.();
  //   //    window.location.href = '/';
  //   //  }
  // }
  if (status === 401) {
    if (!isHandling401) {
      isHandling401 = true;
      clearTokenCallback?.();
    }

    return Promise.reject(error);
  }

  if (status === 403) {
    // Jangan logout
    // Jangan clear token
    return Promise.reject(error);
  }
  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance2.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(responseInterceptor, errorInterceptor);
axiosInstance2.interceptors.response.use(responseInterceptor, errorInterceptor);

export default axiosInstance;
