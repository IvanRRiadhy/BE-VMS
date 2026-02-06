// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { store, persistor } from './store/Store';
import './utils/i18n';
import { SessionProvider } from './customs/contexts/SessionContext';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter, createBrowserRouter } from 'react-router';
import { AuthProvider } from './customs/contexts/AuthProvider';
import App from './App';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Spinner from './views/spinner/Spinner';
import { loadRuntimeConfig } from './config';
import { initializeAxiosBaseURL } from './customs/api/interceptor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <Provider store={store}>
//     <PersistGate loading={<Spinner />} persistor={persistor}>
//       <SessionProvider>
//         <AuthProvider>
//           <QueryClientProvider client={queryClient}>
//             <Suspense fallback={<Spinner />}>
//               <App />
//             </Suspense>
//           </QueryClientProvider>
//         </AuthProvider>
//       </SessionProvider>
//     </PersistGate>
//   </Provider>,
// );

const root = ReactDOM.createRoot(document.getElementById('root')!);

loadRuntimeConfig()
  .then(() => {
    initializeAxiosBaseURL();
    root.render(
      <Provider store={store}>
        <PersistGate loading={<Spinner />} persistor={persistor}>
          <SessionProvider>
            <AuthProvider>
              <QueryClientProvider client={queryClient}>
                <Suspense fallback={<Spinner />}>
                  <App />
                </Suspense>
              </QueryClientProvider>
            </AuthProvider>
          </SessionProvider>
        </PersistGate>
      </Provider>,
    );
  })
  .catch((err) => {
    console.error('Failed to load runtime config:', err);

    // Optional: tampilkan error page
    root.render(
      <div style={{ padding: 24 }}>
        <h2>Configuration Error</h2>
        <p>config.json not found or invalid.</p>
      </div>,
    );
  });
