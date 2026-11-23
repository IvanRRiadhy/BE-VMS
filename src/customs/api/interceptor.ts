// import axios, { AxiosInstance } from 'axios';

// import { getConfig } from 'src/config';
// import { refreshToken } from './users';
// import store from 'src/store/Store';
// import { clearUser } from 'src/store/apps/user/userSlice';

// export let BASE_URL = '';

// export const axiosInstance: AxiosInstance = axios.create({
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true,
// });

// export const axiosInstance2: AxiosInstance = axios.create({
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true,
// });

// export function initializeAxiosBaseURL() {
//   const config = getConfig();

//   BASE_URL = config.API_BASE_URL;

//   axiosInstance.defaults.baseURL = `${BASE_URL}/api`;
//   axiosInstance2.defaults.baseURL = BASE_URL;
// }

// let clearTokenCallback: (() => void) | null = null;

// export const setClearTokenCallback = (callback: () => void) => {
//   clearTokenCallback = callback;
// };

// let isHandling401 = false;

// const handleUnauthorized = () => {
//   if (isHandling401) return;
//   isHandling401 = true;
//   // Bersihkan data user dari redux & storage agar ProtectedRoute tidak menganggap masih login
//   store.dispatch(clearUser());
//   clearTokenCallback?.();
//   // Hanya redirect jika tidak sedang di halaman login/auth
//   if (!window.location.pathname.startsWith('/auth/login')) {
//     window.location.replace('/auth/login');
//   }
//   setTimeout(() => {
//     isHandling401 = false;
//   }, 1000);
// };

// let isRefreshing = false;
// let refreshPromise: Promise<any> | null = null;

// const doRefreshToken = async () => {
//   if (!isRefreshing) {
//     isRefreshing = true;

//     refreshPromise = refreshToken().finally(() => {
//       isRefreshing = false;
//       refreshPromise = null;
//     });
//   }
//   return refreshPromise;
// };

// const responseInterceptor = (response: any) => response;
// const errorInterceptor = async (error: any) => {
//   const status = error.response?.status;
//   const method = error.config?.method?.toLowerCase();
//   const originalRequest = error.config;
//   // 404 untuk GET dianggap sebagai data kosong
//   if (status === 404 && method === 'get') {
//     return Promise.resolve({
//       ...error.response,
//       data: {
//         status: false,
//         status_code: 404,
//         title: 'Not Found',
//         msg: 'Data not found',
//         collection: [],
//         RecordsTotal: 0,
//         RecordsFiltered: 0,
//         Draw: 0,
//       },
//     });
//   }

//   const url = error.config?.url ?? '';
//   const isAuthEndpoint =
//     url.includes('/_Auth/Login') ||
//     url.includes('/_Auth/RequestToken') ||
//     url.includes('/_Auth/RefreshToken');

//   if (status === 401) {
//     // Jika endpoint auth itu sendiri yang 401, langsung logout / reject tanpa coba refresh lagi
//     if (isAuthEndpoint) {
//       if (url.includes('/_Auth/RefreshToken')) {
//         handleUnauthorized();
//       }
//       return Promise.reject(error);
//     }

//     if (!originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         await doRefreshToken();
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         handleUnauthorized();
//         return Promise.reject(refreshError);
//       }
//     } else {
//       handleUnauthorized();
//       return Promise.reject(error);
//     }
//   }
//   if (status === 403) {
//     return Promise.reject(error);
//   }

//   return Promise.reject(error);
// };

// axiosInstance.interceptors.request.use(
//   (config) => {
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// axiosInstance2.interceptors.request.use(
//   (config) => {
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// axiosInstance.interceptors.response.use(responseInterceptor, errorInterceptor);
// axiosInstance2.interceptors.response.use(responseInterceptor, errorInterceptor);

// export default axiosInstance;


// import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// import { getConfig } from 'src/config';
// import store from 'src/store/Store';
// import { clearUser } from 'src/store/apps/user/userSlice';

// export let BASE_URL = '';

// type RetryRequestConfig = InternalAxiosRequestConfig & {
//   _retry?: boolean;
// };

// export const axiosInstance: AxiosInstance = axios.create({
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true,
// });

// export const axiosInstance2: AxiosInstance = axios.create({
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true,
// });

// // Khusus refresh token, tanpa interceptor
// const refreshClient: AxiosInstance = axios.create({
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true,
//   timeout: 15000,
// });

// export function initializeAxiosBaseURL() {
//   const config = getConfig();

//   BASE_URL = config.API_BASE_URL;

//   axiosInstance.defaults.baseURL = `${BASE_URL}/api`;
//   axiosInstance2.defaults.baseURL = BASE_URL;
//   refreshClient.defaults.baseURL = `${BASE_URL}/api`;
// }

// let clearTokenCallback: (() => void) | null = null;

// export const setClearTokenCallback = (callback: () => void) => {
//   clearTokenCallback = callback;
// };

// // =====================================================
// // UNAUTHORIZED HANDLER
// // =====================================================

// let isHandling401 = false;

// const handleUnauthorized = () => {
//   if (isHandling401) return;

//   isHandling401 = true;

//   console.error('[AUTH] Unauthorized. Logging out...');

//   store.dispatch(clearUser());

//   clearTokenCallback?.();

//   if (!window.location.pathname.startsWith('/auth/login')) {
//     window.location.replace('/auth/login');
//   }
// };

// // Panggil setelah login berhasil
// export const resetUnauthorizedState = () => {
//   isHandling401 = false;
// };

// // =====================================================
// // REFRESH TOKEN - SINGLE FLIGHT
// // =====================================================

// let refreshPromise: Promise<void> | null = null;

// const doRefreshToken = (): Promise<void> => {
//   // Jika refresh sedang berjalan, gunakan Promise yang sama
//   if (!refreshPromise) {
//     console.log('[AUTH] Starting refresh token...');

//     refreshPromise = refreshClient
//       .post('/_Auth/RefreshToken', {})
//       .then((response) => {
//         console.log('[AUTH] Refresh successful:', response.status);
//       })
//       .catch((error: AxiosError) => {
//         console.error('[AUTH] Refresh failed:', {
//           status: error.response?.status,
//           message: error.message,
//           data: error.response?.data,
//         });

//         throw error;
//       })
//       .finally(() => {
//         refreshPromise = null;
//       });
//   } else {
//     console.log('[AUTH] Waiting for existing refresh...');
//   }

//   return refreshPromise;
// };

// // =====================================================
// // RESPONSE INTERCEPTOR
// // =====================================================

// const createResponseInterceptor = (instance: AxiosInstance) => {
//   return async (error: AxiosError) => {
//     const status = error.response?.status;

//     const originalRequest = error.config as RetryRequestConfig | undefined;

//     const method = originalRequest?.method?.toLowerCase();

//     // -------------------------------------------------
//     // 404 GET dianggap sebagai data kosong
//     // -------------------------------------------------

//     if (status === 404 && method === 'get') {
//       return Promise.resolve({
//         ...error.response,
//         data: {
//           status: false,
//           status_code: 404,
//           title: 'Not Found',
//           msg: 'Data not found',
//           collection: [],
//           RecordsTotal: 0,
//           RecordsFiltered: 0,
//           Draw: 0,
//         },
//       });
//     }

//     // -------------------------------------------------
//     // 401 UNAUTHORIZED
//     // -------------------------------------------------

//     if (status === 401) {
//       const url = originalRequest?.url?.toLowerCase() ?? '';

//       const isAuthEndpoint =
//         url.includes('/_auth/login') ||
//         url.includes('/_auth/requesttoken') ||
//         url.includes('/_auth/refreshtoken');

//       // Jangan refresh endpoint autentikasi
//       if (isAuthEndpoint) {
//         return Promise.reject(error);
//       }

//       // Jika sudah logout, jangan proses lagi
//       if (isHandling401) {
//         return Promise.reject(error);
//       }

//       // Request tidak tersedia atau sudah pernah retry
//       if (!originalRequest || originalRequest._retry) {
//         handleUnauthorized();
//         return Promise.reject(error);
//       }

//       // Tandai agar request hanya retry satu kali
//       originalRequest._retry = true;

//       try {
//         // Semua API 401 menunggu refresh yang sama
//         await doRefreshToken();

//         // Refresh berhasil, ulangi request sebelumnya
//         console.log('[AUTH] Retrying request:', url);

//         return instance(originalRequest);
//       } catch (refreshError) {
//         // Refresh gagal, logout
//         handleUnauthorized();

//         return Promise.reject(refreshError);
//       }
//     }

//     // -------------------------------------------------
//     // 403 FORBIDDEN
//     // -------------------------------------------------

//     if (status === 403) {
//       return Promise.reject(error);
//     }

//     return Promise.reject(error);
//   };
// };

// // =====================================================
// // REGISTER RESPONSE INTERCEPTORS
// // =====================================================

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   createResponseInterceptor(axiosInstance),
// );

// axiosInstance2.interceptors.response.use(
//   (response) => response,
//   createResponseInterceptor(axiosInstance2),
// );

// export default axiosInstance;



import axios, { AxiosError, AxiosInstance } from 'axios';

import { getConfig } from 'src/config';
import store from 'src/store/Store';
import { clearUser } from 'src/store/apps/user/userSlice';

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

// =====================================================
// INITIALIZE BASE URL
// =====================================================

export function initializeAxiosBaseURL() {
  const config = getConfig();

  BASE_URL = config.API_BASE_URL;

  axiosInstance.defaults.baseURL = `${BASE_URL}/api`;
  axiosInstance2.defaults.baseURL = BASE_URL;
}

// =====================================================
// UNAUTHORIZED HANDLER
// =====================================================

let isHandling401 = false;

let clearTokenCallback: (() => void) | null = null;

export const setClearTokenCallback = (callback: () => void) => {
  clearTokenCallback = callback;
};

const handleUnauthorized = () => {
  // Cegah proses logout dan redirect berulang
  if (isHandling401) return;

  isHandling401 = true;

  console.error('[AUTH] 401 Unauthorized. Logging out...');

  // Bersihkan user Redux
  store.dispatch(clearUser());

  // Bersihkan state/token tambahan jika ada
  clearTokenCallback?.();

  // Redirect hanya jika belum berada di halaman login
  const currentPath = window.location.pathname;

  if (!currentPath.startsWith('/auth/login')) {
    window.location.replace('/auth/login');
  }
};

// Panggil setelah login berhasil
export const resetUnauthorizedState = () => {
  isHandling401 = false;
};

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

const createResponseInterceptor = () => {
  return (error: AxiosError) => {
    const status = error.response?.status;
    const method = error.config?.method?.toLowerCase();

    // -------------------------------------------------
    // 404 GET dianggap sebagai data kosong
    // -------------------------------------------------

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

    // -------------------------------------------------
    // 401 UNAUTHORIZED
    // Langsung logout, tanpa refresh token
    // -------------------------------------------------

    if (status === 401) {
      handleUnauthorized();

      return Promise.reject(error);
    }

    // -------------------------------------------------
    // 403 FORBIDDEN
    // Tidak melakukan logout
    // -------------------------------------------------

    if (status === 403) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  };
};

// =====================================================
// REGISTER RESPONSE INTERCEPTORS
// =====================================================

axiosInstance.interceptors.response.use((response) => response, createResponseInterceptor());

axiosInstance2.interceptors.response.use((response) => response, createResponseInterceptor());

export default axiosInstance;
