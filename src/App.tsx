import { RouterProvider } from 'react-router-dom';

import { AppState } from './store/Store';
import router from './routes/Router';
import {  CssBaseline, ThemeProvider } from '@mui/material';
import { useSelector } from 'src/store/Store';
import { ThemeSettings } from './theme/Theme';
import RTL from './layouts/full/shared/customizer/RTL';
import NotificationProvider from './providers/NotificationProvider';

function App() {
  const theme = ThemeSettings();
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <ThemeProvider theme={theme}>
      <RTL direction={customizer.activeDir}>
        <CssBaseline />
        <NotificationProvider />
        <RouterProvider router={router} />
      </RTL>
    </ThemeProvider>
  );
}

export default App;
