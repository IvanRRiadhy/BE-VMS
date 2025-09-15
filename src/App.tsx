import { CircularProgress, CssBaseline, ThemeProvider, LinearProgress } from '@mui/material';

import { useSelector } from 'src/store/Store';
import { ThemeSettings } from './theme/Theme';
import RTL from './layouts/full/shared/customizer/RTL';
import { Outlet, Route, Routes, useLocation } from 'react-router';
import { AppState } from './store/Store';
import Dashboard from './customs/pages/admin/Dashboard';
import Visitor from './customs/pages/admin/Visitor';
import ManageCompanyAndDepartment from './customs/pages/admin/ManageCompanyAndDepartment';
import ManageEmployee from './customs/pages/admin/ManageEmployee';
import ManageSiteSpace from './customs/pages/admin/ManageSiteSpace';
import ManageVisitorCard from './customs/pages/admin/ManageVisitorCard';
import ManageDeviceKiosk from './customs/pages/admin/ManageDeviceKiosk';
import ManageOperator from './customs/pages/admin/ManageOperator';
import ManageDocument from './customs/pages/admin/ManageDocument';
import ManageBrand from './customs/pages/admin/ManageBrand';
import SettingUser from './customs/pages/admin/SettingUser';
import FormAddUser from './customs/pages/admin/content/content_setting_user/FormAddUser';
import Login2 from './views/authentication/auth2/Login2';
import { useEffect, useState } from 'react';
import { Box } from '@mui/system';
import { ProtectedRoute } from './customs/contexts/ProtectedRoute';
import { useAuth } from './customs/contexts/AuthProvider';
import { useSession } from './customs/contexts/SessionContext';
import { setClearTokenCallback } from './customs/api/interceptor';
import ManageVisitorType from './customs/pages/admin/ManageVisitorType';
import ManageIntegration from './customs/pages/admin/ManageIntegration';
import ManageAccessControl from './customs/pages/admin/ManageAccessControl';
import ManageCustomField from './customs/pages/admin/ManageCustomField';
import ManageIntegrationDetail from './customs/pages/admin/ManageIntegrationDetail';
import ManageSettingSmtp from './customs/pages/admin/ManageSettingSmtp';
import ManageGroupCardAccess from './customs/pages/admin/ManageGroupCardAccess';
import ManageTimezone from './customs/pages/admin/ManageTimezone';

export function App() {
  const theme = ThemeSettings();
  const customizer = useSelector((state: AppState) => state.customizer);

  const location = useLocation();
  const { loading: authLoading } = useAuth();
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    setRouteLoading(true);
    const timeout = setTimeout(() => {
      setRouteLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [location]);

  const loading = authLoading || routeLoading;

  const { clearToken } = useSession();

  useEffect(() => {
    setClearTokenCallback(clearToken);
  }, [clearToken]);

  return (
    <ThemeProvider theme={theme}>
      <RTL direction={customizer.activeDir}>
        <CssBaseline />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Routes>
            <Route path="/" element={<Login2 />} />
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/visitor"
              element={
                <ProtectedRoute>
                  <Visitor />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/manage/companys-deparments"
              element={
                <ProtectedRoute>
                  <ManageCompanyAndDepartment />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/manage/employees"
              element={
                <ProtectedRoute>
                  <ManageEmployee />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="admin/manage/employees/add-employee"
              element={
                <ProtectedRoute>
                  <FormWizardAddEmployee />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="admin/manage/site-space"
              element={
                <ProtectedRoute>
                  <ManageSiteSpace />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/manage/card"
              element={
                <ProtectedRoute>
                  <ManageVisitorCard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/manage/group-card"
              element={
                <ProtectedRoute>
                  <ManageGroupCardAccess />
                </ProtectedRoute>
              }
            />{' '}
            <Route
              path="admin/manage/timezone"
              element={
                <ProtectedRoute>
                  <ManageTimezone />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/manage/visitor-type"
              element={
                <ProtectedRoute>
                  <ManageVisitorType />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/manage/device-kiosk"
              element={
                <ProtectedRoute>
                  <ManageDeviceKiosk />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/manage/operator"
              element={
                <ProtectedRoute>
                  <ManageOperator />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/manage/document"
              element={
                <ProtectedRoute>
                  <ManageDocument />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/manage/brand"
              element={
                <ProtectedRoute>
                  <ManageBrand />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/manage/integration"
              element={
                <ProtectedRoute>
                  <ManageIntegration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage/integration/:id"
              element={
                <ProtectedRoute>
                  <ManageIntegrationDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/manage/access-control"
              element={
                <ProtectedRoute>
                  <ManageAccessControl />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/manage/custom-field"
              element={
                <ProtectedRoute>
                  <ManageCustomField />
                </ProtectedRoute>
              }
            />
            {/* Setting smtp */}
            <Route
              path="admin/manage/setting-smtp"
              element={
                <ProtectedRoute>
                  <ManageSettingSmtp />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/setting/users"
              element={
                <ProtectedRoute>
                  <SettingUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/setting/users/add-user"
              element={
                <ProtectedRoute>
                  <FormAddUser />
                </ProtectedRoute>
              }
            />
          </Routes>
        )}
      </RTL>
    </ThemeProvider>
  );
}
