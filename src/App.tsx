import { CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import { useSelector } from 'src/store/Store';
import { ThemeSettings } from './theme/Theme';
import RTL from './layouts/full/shared/customizer/RTL';
import { Route, Routes, Navigate, useLocation } from 'react-router';
import { AppState } from './store/Store';
import { useEffect, useState } from 'react';
import { Box } from '@mui/system';
import { ProtectedRoute } from './customs/contexts/ProtectedRoute';
import { useAuth } from './customs/contexts/AuthProvider';
import { useSession } from './customs/contexts/SessionContext';
import { setClearTokenCallback } from './customs/api/interceptor';

// pages
import Login2 from './views/authentication/auth2/Login2';
import GuestInformation from './views/authentication/guest/GuestInformation';
import WaitingPage from './customs/components/page/WaitingPage';
import GuestLayout from './customs/pages/Guest/GuestLayout';
import DashboardLayout from './customs/pages/Guest/Dashboard';
import PageAcces from './customs/pages/Guest/PageAcces';
import Invitation from './customs/pages/Guest/Invitation/Invitation';
import History from './customs/pages/Guest/History/History';
import Report from './customs/pages/Guest/Report/Report';
import Approval from './customs/pages/Guest/Approval/Approval';
import Parking from './customs/pages/Guest/Parking/Parking';
import AlarmPage from './customs/pages/Guest/Alarm/AlarmPage';
import Evacuate from './customs/pages/Guest/Evacuate/Evacuate';
import Visitor from './customs/pages/Guest/Visitor/Visitor';

import Dashboard from './customs/pages/admin/Dashboard';
import ManageVisitor from './customs/pages/admin/ManageVisitor';
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
import ManageVisitorType from './customs/pages/admin/ManageVisitorType';
import ManageIntegration from './customs/pages/admin/ManageIntegration';
import ManageAccessControl from './customs/pages/admin/ManageAccessControl';
import ManageCustomField from './customs/pages/admin/ManageCustomField';
import ManageIntegrationDetail from './customs/pages/admin/ManageIntegrationDetail';
import ManageSettingSmtp from './customs/pages/admin/ManageSettingSmtp';
import ManageGroupCardAccess from './customs/pages/admin/ManageGroupCardAccess';
import ManageTimezone from './customs/pages/admin/ManageTimezone';
import ManageSettingVisitor from './customs/pages/admin/ManageSettingVIsitor';

export function App() {
  const theme = ThemeSettings();
  const customizer = useSelector((state: AppState) => state.customizer);

  const location = useLocation();
  const { loading: authLoading, isAuthenticated, authType } = useAuth();
  const [routeLoading, setRouteLoading] = useState(false);

  const { clearToken } = useSession();
  useEffect(() => {
    setClearTokenCallback(clearToken);
  }, [clearToken]);

  // route loading simulasi
  useEffect(() => {
    setRouteLoading(true);
    const timeout = setTimeout(() => setRouteLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, [location]);

  const loading = authLoading || routeLoading;

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
            {/* AUTO REDIRECT ROOT */}
            {/* <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate
                    to={authType === 'admin' ? '/admin/dashboard' : '/guest/dashboard'}
                    replace
                  />
                ) : (
                  <Login2 />
                )
              }
            /> */}

            <Route path="/" element={<Login2 />} />

            {/* Portal route tanpa proteksi */}
            <Route path="/portal/information" element={<GuestInformation />} />
            <Route path="/portal/waiting" element={<WaitingPage />} />

            {/* Guest group */}
            <Route element={<ProtectedRoute requireType="guest" />}>
              <Route path="/guest" element={<GuestLayout />}>
                <Route index element={<DashboardLayout />} />
                <Route path="dashboard" element={<DashboardLayout />} />
                <Route path="access-page" element={<PageAcces />} />
                <Route path="invitation" element={<Invitation />} />
                <Route path="history" element={<History />} />
                <Route path="report" element={<Report />} />
                <Route path="approval" element={<Approval />} />
                <Route path="parking" element={<Parking />} />
                <Route path="alarm" element={<AlarmPage />} />
                <Route path="evacuate" element={<Evacuate />} />
                <Route path="visitor" element={<Visitor />} />
              </Route>
            </Route>

            {/* Admin group */}
            <Route element={<ProtectedRoute requireType="admin" />}>
              <Route path="admin/dashboard" element={<Dashboard />} />
              <Route path="admin/visitor" element={<ManageVisitor />} />
              <Route
                path="admin/manage/companys-deparments"
                element={<ManageCompanyAndDepartment />}
              />
              <Route path="admin/manage/employees" element={<ManageEmployee />} />
              <Route path="admin/manage/site-space" element={<ManageSiteSpace />} />
              <Route path="admin/manage/card" element={<ManageVisitorCard />} />
              <Route path="admin/manage/group-card" element={<ManageGroupCardAccess />} />
              <Route path="admin/manage/timezone" element={<ManageTimezone />} />
              <Route path="admin/manage/visitor-type" element={<ManageVisitorType />} />
              <Route path="admin/manage/device-kiosk" element={<ManageDeviceKiosk />} />
              <Route path="admin/manage/operator" element={<ManageOperator />} />
              <Route path="admin/manage/document" element={<ManageDocument />} />
              <Route path="admin/manage/brand" element={<ManageBrand />} />
              <Route path="admin/manage/integration" element={<ManageIntegration />} />
              <Route path="admin/manage/integration/:id" element={<ManageIntegrationDetail />} />
              <Route path="admin/manage/access-control" element={<ManageAccessControl />} />
              <Route path="admin/manage/custom-field" element={<ManageCustomField />} />
              <Route path="admin/manage/setting-smtp" element={<ManageSettingSmtp />} />
              <Route path="admin/settings" element={<ManageSettingVisitor />} />
              <Route path="admin/setting/users" element={<SettingUser />} />
              <Route path="admin/setting/users/add-user" element={<FormAddUser />} />
            </Route>
          </Routes>
        )}
      </RTL>
    </ThemeProvider>
  );
}
