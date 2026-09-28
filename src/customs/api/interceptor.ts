import axios, { AxiosInstance } from 'axios';

import { getConfig } from 'src/config';
import { refreshToken } from './users';

export let BASE_URL = '';

export const axiosInstance: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const axiosInstance2: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export function initializeAxiosBaseURL() {
  const config = getConfig();

  BASE_URL = config.API_BASE_URL;

  axiosInstance.defaults.baseURL = `${BASE_URL}/api`;
  axiosInstance2.defaults.baseURL = BASE_URL;
}

let clearTokenCallback: (() => void) | null = null;

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

const doRefreshToken = async () => {
  if (!isRefreshing) {
    isRefreshing = true;

    refreshPromise = refreshToken().finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  }
};

let isHandling401 = false;

const responseInterceptor = (response: any) => response;
const errorInterceptor = async (error: any) => {
  const status = error.response?.status;
  const method = error.config?.method?.toLowerCase();
  const originalRequest = error.config;
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
  //   status === 401 &&
  //   originalRequest &&
  //   !originalRequest._retry &&
  //   !originalRequest.url?.includes('/_Auth/RefreshToken')
  // ) {
  //   originalRequest._retry = true;

  //   try {
  //     await doRefreshToken();
  //     return axiosInstance(originalRequest);
  //   } catch (refreshError) {
  //     return Promise.reject(refreshError);
  //   }
  // }

  if (status === 403) {
    return Promise.reject(error);
  }

  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance2.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(responseInterceptor, errorInterceptor);
axiosInstance2.interceptors.response.use(responseInterceptor, errorInterceptor);

export default axiosInstance;
