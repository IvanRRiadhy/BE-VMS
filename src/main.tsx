// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { store } from './store/Store';
import './utils/i18n';
import './_mockApis';
import { SessionProvider } from './customs/contexts/SessionContext';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from './customs/contexts/AuthProvider';
import { App } from './App';
// app.css
import './App.css';
import 'video.js/dist/video-js.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <SessionProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </SessionProvider>
  </Provider>,
);
