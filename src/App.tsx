import { CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import { useSelector } from 'src/store/Store';
import { ThemeSettings } from './theme/Theme';
import RTL from './layouts/full/shared/customizer/RTL';
import { Route, Routes, Navigate, useLocation } from 'react-router';
import { AppState } from './store/Store';
import { useEffect } from 'react';
import { Box } from '@mui/system';
import { ProtectedRoute } from './customs/contexts/ProtectedRoute';
import { useAuth } from './customs/contexts/AuthProvider';
import { useSession } from './customs/contexts/SessionContext';
import { setClearTokenCallback } from './customs/api/interceptor';
import { GroupRoleId } from './constant/GroupRoleId';

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
import ManageSettingVisitor from './customs/pages/admin/ManageSettingVisitor';
import ManageScheduler from './customs/pages/admin/ManageScheduler';
import ManageUser from './customs/pages/admin/ManageUser';
import ManageReport from './customs/pages/admin/ManageReport';

import EmployeeLayout from './customs/pages/Employee/EmployeeLayout';
import DashboardEmployee from './customs/pages/Employee/Dashboard';
import ApprovalEmployee from './customs/pages/Employee/Approval';
import InvitationEmployee from './customs/pages/Employee/Invitation/Invitation';
import VisitorEmployee from './customs/pages/Employee/Visitor';
import HistoryEmployee from './customs/pages/Employee/History';
import ReportEmployee from './customs/pages/Employee/Report';
import ParkingEmployee from './customs/pages/Employee/Parking';
import ProfileEmployee from './customs/pages/Employee/DetailProfile';

import OperatorLayout from './customs/pages/Operator/OperatorLayout';
import DashboardOperator from './customs/pages/Operator/Dashboard';

import ManagerLayout from './customs/pages/Manager/ManagerLayout';
import DashboardManager from './customs/pages/Manager/Dashboard';
import ApprovalManager from './customs/pages/Manager/Approval';
import ParkingManager from './customs/pages/Manager/Parking';
import InvitationManager from './customs/pages/Manager/Invitation';
import VisitorManager from './customs/pages/Manager/Visitor';
import HistoryManager from './customs/pages/Manager/History';
import ReportManager from './customs/pages/Manager/Report';
import DetailProfile from './layouts/full/vertical/header/DetailProfile';
import UnauthorizedPage from './customs/components/page/UnauthorizedPage';
import NotFoundPage from './views/authentication/NotFoundPage';

export function App() {
  const theme = ThemeSettings();
  const customizer = useSelector((state: AppState) => state.customizer);

  const location = useLocation();
  const { loading: authLoading, isAuthenticated, groupId } = useAuth();
  const { clearToken } = useSession();

  // setup interceptor clear token
  useEffect(() => {
    setClearTokenCallback(clearToken);
  }, [clearToken]);

  // tunggu auth dan group siap
  const isAuthReady = !authLoading && isAuthenticated && !!groupId;

  // redirect otomatis jika di root path
  useEffect(() => {
    if (isAuthReady) {
      const redirectPath =
        groupId?.toUpperCase() === GroupRoleId.Admin
          ? '/admin/dashboard'
          : groupId?.toUpperCase() === GroupRoleId.Manager
          ? '/manager/dashboard'
          : groupId?.toUpperCase() === GroupRoleId.Employee
          ? '/employee/dashboard'
          : groupId?.toUpperCase() === GroupRoleId.OperatorVMS
          ? '/operator/dashboard'
          : '/guest/dashboard';

      if (location.pathname === '/' || location.pathname === '/*') {
        window.location.replace(redirectPath);
      }
    }
  }, [isAuthReady, groupId, location.pathname]);

  // if (authLoading || (!isAuthenticated && location.pathname !== '/')) {
  //   return (
  //     <ThemeProvider theme={theme}>
  //       <RTL direction={customizer.activeDir}>
  //         <CssBaseline />
  //         <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
  //           <CircularProgress color="primary" />
  //         </Box>
  //       </RTL>
  //     </ThemeProvider>
  //   );
  // }

  return (
    <ThemeProvider theme={theme}>
      <RTL direction={customizer.activeDir}>
        <CssBaseline />
        <Routes>
          {/* ROUTES PUBLIC */}
          <Route path="/" element={<Login2 />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/portal/information" element={<GuestInformation />} />
          <Route path="/portal/waiting" element={<WaitingPage />} />

          {/* GUEST */}
          <Route element={<ProtectedRoute />}>
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
              <Route path="profile" element={<DetailProfile />} />
            </Route>
          </Route>

          {/* ADMIN */}
          <Route element={<ProtectedRoute allowedGroups={[GroupRoleId.Admin]} />}>
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
            <Route path="admin/manage/scheduler" element={<ManageScheduler />} />
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
            <Route path="admin/user" element={<ManageUser />} />
            <Route path="admin/report" element={<ManageReport />} />
            <Route path="admin/setting/users/add-user" element={<FormAddUser />} />
            <Route path="profile" element={<DetailProfile />} />
          </Route>

          {/* EMPLOYEE */}
          <Route element={<ProtectedRoute allowedGroups={[GroupRoleId.Employee]} />}>
            <Route path="/employee" element={<EmployeeLayout />}>
              <Route index path="dashboard" element={<DashboardEmployee />} />
              <Route path="approval" element={<ApprovalEmployee />} />
              <Route path="invitation" element={<InvitationEmployee />} />
              <Route path="parking" element={<ParkingEmployee />} />
              <Route path="report" element={<ReportEmployee />} />
              <Route path="visitor" element={<VisitorEmployee />} />
              <Route path="history" element={<HistoryEmployee />} />
              <Route path="profile" element={<ProfileEmployee />} />
            </Route>
          </Route>

          {/* OPERATOR */}
          <Route element={<ProtectedRoute allowedGroups={[GroupRoleId.OperatorVMS]} />}>
            <Route path="/operator" element={<OperatorLayout />}>
              <Route index path="dashboard" element={<DashboardOperator />} />
            </Route>
          </Route>

          {/* MANAGER */}
          <Route element={<ProtectedRoute allowedGroups={[GroupRoleId.Manager]} />}>
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index path="dashboard" element={<DashboardManager />} />
              <Route path="approval" element={<ApprovalManager />} />
              <Route path="invitation" element={<InvitationManager />} />
              <Route path="parking" element={<ParkingManager />} />
              <Route path="visitor" element={<VisitorManager />} />
              <Route path="history" element={<HistoryManager />} />
              <Route path="report" element={<ReportManager />} />
              <Route path="profile" element={<DetailProfile />} />
            </Route>
          </Route>

          {/* NOT FOUND */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </RTL>
    </ThemeProvider>
  );
}
