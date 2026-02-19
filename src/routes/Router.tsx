// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Loadable from 'src/layouts/full/shared/loadable/Loadable';
import { ProtectedRoute } from 'src/customs/contexts/ProtectedRoute';
import { GroupRoleId } from '../constant/GroupRoleId';
import AuthRedirector from './AuthRedirector';
import StaffLayout from 'src/customs/pages/Employee/DeliveryStaff/StaffLayout';
import Register from 'src/views/authentication/auth2/Register';
import ForgotPassword from 'src/views/authentication/auth2/ForgotPassword';
import ExpiredPage from 'src/views/authentication/auth2/ExpiredPage';
import LimitedInvitation from 'src/views/authentication/auth2/LimitedInvitation';
// import ForgotPassword2 from 'src/views/authentication/auth2/ForgotPassword2';

/* ***Layouts**** */
const GuestLayout = Loadable(lazy(() => import('src/customs/pages/Guest/GuestLayout')));
const EmployeeLayout = Loadable(lazy(() => import('src/customs/pages/Employee/EmployeeLayout')));
const OperatorLayout = Loadable(lazy(() => import('src/customs/pages/Operator/OperatorLayout')));
const ManagerLayout = Loadable(lazy(() => import('src/customs/pages/Manager/ManagerLayout')));
const BlankLayout = Loadable(lazy(() => import('src/layouts/blank/BlankLayout')));

/* Auth Pages */
const Login = Loadable(lazy(() => import('src/views/authentication/auth2/Login')));
const UnauthorizedPage = Loadable(
  lazy(() => import('src/customs/components/page/UnauthorizedPage')),
);
const NotFoundPage = Loadable(lazy(() => import('src/views/authentication/NotFoundPage')));
const GuestInformation = Loadable(
  lazy(() => import('src/views/authentication/guest/GuestInformation')),
);
const WaitingPage = Loadable(lazy(() => import('src/customs/components/page/WaitingPage')));
const DetailProfile = Loadable(
  lazy(() => import('src/layouts/full/vertical/header/DetailProfile')),
);
//

/* Guest Pages */
const DashboardLayout = Loadable(lazy(() => import('src/customs/pages/Guest/Dashboard')));
const PageAcces = Loadable(lazy(() => import('src/customs/pages/Guest/PageAcces')));
const Invitation = Loadable(lazy(() => import('src/customs/pages/Guest/Invitation/Invitation')));
const History = Loadable(lazy(() => import('src/customs/pages/Guest/History/History')));
const Report = Loadable(lazy(() => import('src/customs/pages/Guest/Report/Report')));
const Approval = Loadable(lazy(() => import('src/customs/pages/Guest/Approval/Approval')));
const Parking = Loadable(lazy(() => import('src/customs/pages/Guest/Parking/Parking')));
const AlarmPage = Loadable(lazy(() => import('src/customs/pages/Guest/Alarm/AlarmPage')));
const Evacuate = Loadable(lazy(() => import('src/customs/pages/Guest/Evacuate/Evacuate')));
const Visitor = Loadable(lazy(() => import('src/customs/pages/Guest/Visitor/Visitor')));

/* Admin Pages */
const Dashboard = Loadable(lazy(() => import('src/customs/pages/admin/content/Dashboard/Content')));
const ManageVisitor = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Visitor/Trx/Content')),
);
const ManageTransactionVisitor = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Visitor/Transaction/Content')),
);
const ManageBlacklistVisitor = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Visitor/Blacklist/Content')),
);

const ManageListVisitor = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Visitor/List/Content')),
);
const ManageCompanyAndDepartment = Loadable(
  lazy(() => import('src/customs/pages/admin/content/CompanyDepartment/Content')),
);
const ManageEmployee = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Employee/Content')),
);

const ManageVip = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Enrollment/Vip/Content')),
);

const ManageVendor = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Enrollment/Vendor/Content')),
);

const ManageSiteSpace = Loadable(
  lazy(() => import('src/customs/pages/admin/content/SiteSpace/Content')),
);
const ManageVisitorCard = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Card/Content')),
);
// const ManageDeviceKiosk = Loadable(lazy(() => import('src/customs/pages/admin/ManageDeviceKiosk')));

const ManageDocument = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Document/Content')),
);
const ManageBrand = Loadable(lazy(() => import('src/customs/pages/admin/content/Brand/Content')));
// const SettingUser = Loadable(
//   lazy(() => import('src/customs/pages/admin/content/content_setting_user/Content')),
// );
// const FormAddUser = Loadable(
//   lazy(() => import('src/customs/pages/admin/content/content_setting_user/FormAddUser')),
// );
const ManageVisitorType = Loadable(
  lazy(() => import('src/customs/pages/admin/content/VisitorType/Content')),
);
const ManageIntegration = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Integration/Content')),
);
const ManageIntegrationDetail = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Integration/ManageIntegrationDetail')),
);
const ManageAccessControl = Loadable(
  lazy(() => import('src/customs/pages/admin/content/AccessControl/Content')),
);
const ManageCustomField = Loadable(
  lazy(() => import('src/customs/pages/admin/content/CustomField/Content')),
);
const ManageSettingSmtp = Loadable(
  lazy(() => import('src/customs/pages/admin/content/SettingSmtp/Content')),
);
// const ManageGroupCardAccess = Loadable(
//   lazy(() => import('src/customs/pages/admin/ManageGroupCardAccess')),
// );
const ManageTimezone = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Timezone/Context')),
);
const ManageSettingVisitor = Loadable(
  lazy(() => import('src/customs/pages/admin/content/SettingVisitorOperator/Content')),
);
const ManageDelivery = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Delivery/Driver/Content')),
);
const ManageDeliveryScheduler = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Delivery/Schduler/Content')),
);
const ManageDeliveryVisit = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Delivery/Visit/Content')),
);
const ManageDetailScheduler = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Delivery/Schduler/DetailSchduler')),
);
const ManageUser = Loadable(lazy(() => import('src/customs/pages/admin/content/User/Content')));
const ManageUserGroup = Loadable(lazy(() => import('src/customs/pages/admin/content/User/UserGroup/Content')));
const ManageReportTransaction = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Report/TransactionLog/Content')),
);

const ManageReportApproval = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Report/Approval/Content')),
);

const ManageReportOperatorActivityLog = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Report/OperatorActivityLog/Content')),
);
const ManageZone = Loadable(lazy(() => import('src/customs/pages/admin/content/Zone/Content')));
const ManagePrintBadge = Loadable(
  lazy(() => import('src/customs/pages/admin/content/PrintBadge/Content')),
);
const ManageEvacuate = Loadable(
  lazy(() => import('src/customs/pages/admin/content/Evacuate/Content')),
);
/* ****EMPLOYEE PAGES**** */
const DashboardEmployee = Loadable(lazy(() => import('src/customs/pages/Employee/Dashboard')));
const ApprovalEmployee = Loadable(lazy(() => import('src/customs/pages/Employee/Approval')));
const InvitationEmployee = Loadable(
  lazy(() => import('src/customs/pages/Employee/Invitation/Invitation')),
);
const ParkingEmployee = Loadable(lazy(() => import('src/customs/pages/Employee/Parking')));
const ReportEmployee = Loadable(lazy(() => import('src/customs/pages/Employee/Report')));
const VisitorEmployee = Loadable(lazy(() => import('src/customs/pages/Employee/Visitor')));
const HistoryEmployee = Loadable(lazy(() => import('src/customs/pages/Employee/History')));
const ProfileEmployee = Loadable(lazy(() => import('src/customs/pages/Employee/DetailProfile')));

/* Operator Pages* */
const DashboardOperator = Loadable(lazy(() => import('src/customs/pages/Operator/Dashboard')));
const OperatorView = Loadable(lazy(() => import('src/customs/pages/Operator/OperatorView')));
const TransactionOperatorLog = Loadable(
  lazy(() => import('src/customs/pages/Operator/Report/TranasctionLog/Content')),
);
const ApprovalOperator = Loadable(
  lazy(() => import('src/customs/pages/Operator/Report/Approval/Content')),
);
const OperatorActivityLog = Loadable(
  lazy(() => import('src/customs/pages/Operator/Report/OperatorActivityLog/Content')),
);
const MonitoringDashboard = Loadable(
  lazy(() => import('src/customs/pages/Operator/Monitoring/Content')),
);

/* Manager Pages*/
const DashboardManager = Loadable(lazy(() => import('src/customs/pages/Manager/Dashboard')));
const ApprovalManager = Loadable(lazy(() => import('src/customs/pages/Manager/Approval')));
const ParkingManager = Loadable(lazy(() => import('src/customs/pages/Manager/Parking')));
const InvitationManager = Loadable(lazy(() => import('src/customs/pages/Manager/Invitation')));
const VisitorManager = Loadable(lazy(() => import('src/customs/pages/Manager/Visitor')));
const HistoryManager = Loadable(lazy(() => import('src/customs/pages/Manager/History')));
const ReportManager = Loadable(lazy(() => import('src/customs/pages/Manager/Report')));

/* Delivery Staff Pages*/
const DashboardStaff = Loadable(
  lazy(() => import('src/customs/pages/Employee/DeliveryStaff/Dashboard')),
);
const ScheduleInvitation = Loadable(
  lazy(() => import('src/customs/pages/Employee/DeliveryStaff/Schedule-Invitation/Content')),
);
const ParkingStaff = Loadable(
  lazy(() => import('src/customs/pages/Employee/DeliveryStaff/Parking/Content')),
);
const ReportStaff = Loadable(
  lazy(() => import('src/customs/pages/Employee/DeliveryStaff/Report/Content')),
);
const HistoryStaff = Loadable(
  lazy(() => import('src/customs/pages/Employee/DeliveryStaff/History/Content')),
);
const ProfileStaff = Loadable(
  lazy(() => import('src/customs/pages/Employee/DeliveryStaff/Profile/Content')),
);

const Router = [
  {
    element: <AuthRedirector />,
    // path: '/',
    // children: [
    //   {
    //     index: true,
    //     element: <AuthRedirector />,
    //   },
    //   {
    //     element: <BlankLayout />,
    //     children: [
    //       { path: '/auth/login', element: <Login /> },
    //       { path: '/unauthorized', element: <UnauthorizedPage /> },
    //       { path: '/portal/information', element: <GuestInformation /> },
    //       { path: '/portal/waiting', element: <WaitingPage /> },
    //       { path: '*', element: <NotFoundPage /> },
    //     ],
    //   },
    children: [
      {
        path: '/',
        children: [
          {
            index: true,
            element: <Navigate to="/auth/login" replace />,
          },
          {
            element: <BlankLayout />,
            children: [
              { path: '/auth/login', element: <Login /> },
              { path: '/auth/register', element: <Register /> },
              { path: '/auth/expired', element: <ExpiredPage /> },
              { path: '/auth/limited', element: <LimitedInvitation /> },
              { path: '/auth/forgot-password', element: <ForgotPassword /> },
              { path: '/unauthorized', element: <UnauthorizedPage /> },
              { path: '/portal/information', element: <GuestInformation /> },
              { path: '/portal/waiting', element: <WaitingPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },

      // ✅ Guest routes (Protected)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/guest',
            element: <GuestLayout />,
            children: [
              { index: true, element: <DashboardLayout /> },
              { path: 'dashboard', element: <DashboardLayout /> },
              { path: 'access-page', element: <PageAcces /> },
              { path: 'invitation', element: <Invitation /> },
              { path: 'history', element: <History /> },
              { path: 'report', element: <Report /> },
              { path: 'approval', element: <Approval /> },
              // { path: 'parking', element: <Parking /> },
              { path: 'alarm', element: <AlarmPage /> },
              { path: 'evacuate', element: <Evacuate /> },
              { path: 'visitor', element: <Visitor /> },
              { path: 'profile', element: <DetailProfile /> },
            ],
          },
          {
            path: '/parking',
            element: <Parking />,
          },
        ],
      },

      // Operator Admin
      // {
      //   element: <ProtectedRoute allowedGroups={[GroupRoleId.OperatorAdmin]} />,
      //   children: [
      //     { path: '/operator-admin/dashboard', element: <Dashboard /> },
      //     { path: '/operator-admin/visitor', element: <ManageVisitor /> },
      //     { path: '/operator-admin/visitor/list-visitor', element: <ManageListVisitor /> },
      //     { path: '/operator-admin/visitor/live-visitor', element: <ManageVisitor /> },
      //     {
      //       path: '/operator-admin/visitor/transaction-visitor',
      //       element: <ManageTransactionVisitor />,
      //     },
      //     {
      //       path: '/operator-admin/visitor/blacklist-visitor',
      //       element: <ManageBlacklistVisitor />,
      //     },
      //     {
      //       path: '/operator-admin/manage/companys-deparments',
      //       element: <ManageCompanyAndDepartment />,
      //     },
      //     { path: '/operator-admin/manage/employees', element: <ManageEmployee /> },
      //     { path: '/operator-admin/manage/vip', element: <ManageVip /> },
      //     { path: '/operator-admin/manage/vendor', element: <ManageVendor /> },
      //     { path: '/operator-admin/manage/delivery', element: <ManageDelivery /> },
      //     { path: '/operator-admin/manage/delivery/staff', element: <ManageDelivery /> },
      //     { path: '/operator-admin/visitor/scheduler', element: <ManageDeliveryScheduler /> },
      //     {
      //       path: '/operator-admin/visitor/scheduler/detail/:id',
      //       element: <ManageDetailScheduler />,
      //     },
      //     { path: '/operator-admin/manage/delivery/visit', element: <ManageDeliveryVisit /> },
      //     {
      //       path: '/operator-admin/manage/site-space/*',
      //       element: <ManageSiteSpace />,
      //     },
      //     { path: '/operator-admin/manage/card', element: <ManageVisitorCard /> },
      //     { path: '/operator-admin/manage/time-access', element: <ManageTimezone /> },
      //     { path: '/operator-admin/manage/visitor-type', element: <ManageVisitorType /> },
      //     { path: '/operator-admin/manage/document', element: <ManageDocument /> },
      //     { path: '/operator-admin/manage/brand', element: <ManageBrand /> },
      //     { path: '/operator-admin/manage/integration', element: <ManageIntegration /> },
      //     { path: '/operator-admin/manage/integration/:id', element: <ManageIntegrationDetail /> },
      //     { path: '/operator-admin/manage/access-control', element: <ManageAccessControl /> },
      //     { path: '/operator-admin/manage/custom-field', element: <ManageCustomField /> },
      //     { path: '/operator-admin/manage/zone', element: <ManageZone /> },
      //     { path: '/operator-admin/manage/setting-smtp', element: <ManageSettingSmtp /> },
      //     { path: '/operator-admin/settings', element: <ManageSettingVisitor /> },
      //     { path: '/operator-admin/user', element: <ManageUser /> },
      //     { path: '/operator-admin/report/transaction-log', element: <ManageReportTransaction /> },
      //     { path: '/operator-admin/report/approval-workflow', element: <ManageReportApproval /> },
      //     {
      //       path: '/operator-admin/report/operator-activity-log',
      //       element: <ManageReportOperatorActivityLog />,
      //     },
      //     { path: '/profile', element: <DetailProfile /> },
      //     { path: '/operator-admin/print-badge', element: <ManagePrintBadge /> },
      //     { path: '/operator-admin/evacuate', element: <ManageEvacuate /> },
      //   ],
      // },

      // ✅ Admin routes
      {
        element: <ProtectedRoute allowedGroups={[GroupRoleId.Admin]} />,
        children: [
          { path: '/admin/dashboard', element: <Dashboard /> },
          { path: '/admin/visitor', element: <ManageVisitor /> },
          { path: '/admin/visitor/list-visitor', element: <ManageListVisitor /> },
          { path: '/admin/visitor/live-visitor', element: <ManageVisitor /> },
          { path: '/admin/visitor/transaction-visitor', element: <ManageTransactionVisitor /> },
          { path: '/admin/visitor/blacklist-visitor', element: <ManageBlacklistVisitor /> },
          { path: '/admin/manage/companys-deparments', element: <ManageCompanyAndDepartment /> },
          { path: '/admin/manage/employees', element: <ManageEmployee /> },
          { path: '/admin/manage/vip', element: <ManageVip /> },
          { path: '/admin/manage/vendor', element: <ManageVendor /> },
          { path: '/admin/manage/delivery', element: <ManageDelivery /> },
          { path: '/admin/manage/delivery/staff', element: <ManageDelivery /> },
          { path: '/admin/visitor/scheduler', element: <ManageDeliveryScheduler /> },
          {
            path: '/admin/visitor/scheduler/detail/:id',
            element: <ManageDetailScheduler />,
          },
          { path: '/admin/manage/delivery/visit', element: <ManageDeliveryVisit /> },
          {
            path: '/admin/manage/site-space/*',
            element: <ManageSiteSpace />,
          },
          { path: '/admin/manage/card', element: <ManageVisitorCard /> },
          { path: '/admin/manage/time-access', element: <ManageTimezone /> },
          { path: '/admin/manage/visitor-type', element: <ManageVisitorType /> },
          { path: '/admin/manage/document', element: <ManageDocument /> },
          { path: '/admin/manage/brand', element: <ManageBrand /> },
          { path: '/admin/manage/integration', element: <ManageIntegration /> },
          { path: '/admin/manage/integration/:id', element: <ManageIntegrationDetail /> },
          { path: '/admin/manage/access-control', element: <ManageAccessControl /> },
          { path: '/admin/manage/custom-field', element: <ManageCustomField /> },
          { path: '/admin/manage/zone', element: <ManageZone /> },
          { path: '/admin/manage/setting-smtp', element: <ManageSettingSmtp /> },
          { path: '/admin/settings', element: <ManageSettingVisitor /> },
          { path: '/admin/user', element: <ManageUser /> },
          { path: '/admin/user-group', element: <ManageUserGroup /> },
          { path: '/admin/report/transaction-log', element: <ManageReportTransaction /> },
          { path: '/admin/report/approval-workflow', element: <ManageReportApproval /> },
          {
            path: '/admin/report/operator-activity-log',
            element: <ManageReportOperatorActivityLog />,
          },
          { path: '/profile', element: <DetailProfile /> },
          { path: '/admin/print-badge', element: <ManagePrintBadge /> },
          { path: '/admin/evacuate', element: <ManageEvacuate /> },
        ],
      },

      // ✅ Employee
      {
        element: <ProtectedRoute allowedGroups={[GroupRoleId.Employee]} />,
        children: [
          {
            path: '/employee',
            element: <EmployeeLayout />,
            children: [
              { index: true, element: <DashboardEmployee /> },
              { path: 'dashboard', element: <DashboardEmployee /> },
              { path: 'approval', element: <ApprovalEmployee /> },
              { path: 'invitation', element: <InvitationEmployee /> },
              { path: 'parking', element: <ParkingEmployee /> },
              { path: 'report', element: <ReportEmployee /> },
              { path: 'history', element: <HistoryEmployee /> },
              { path: 'profile', element: <ProfileEmployee /> },
            ],
          },
          {
            path: '/delivery-staff',
            element: <StaffLayout />,
            children: [
              { index: true, element: <DashboardStaff /> },
              { path: 'dashboard', element: <DashboardStaff /> },
              { path: 'schedule-invitation', element: <ScheduleInvitation /> },
              { path: 'parking', element: <ParkingStaff /> },
              { path: 'report', element: <ReportStaff /> },
              { path: 'history', element: <HistoryStaff /> },
              { path: 'profile', element: <ProfileStaff /> },
            ],
          },
        ],
      },

      // ✅ Operator
      {
        element: <ProtectedRoute allowedGroups={[GroupRoleId.OperatorVMS]} />,
        children: [
          {
            path: '/operator',
            element: <OperatorLayout />,
            children: [
              { index: true, element: <DashboardOperator /> },
              { path: 'dashboard', element: <DashboardOperator /> },
              { path: 'view', element: <OperatorView /> },
              { path: 'transaction-log', element: <TransactionOperatorLog /> },
              { path: 'approval-workflow', element: <ApprovalOperator /> },
              { path: 'operator-activity-log', element: <OperatorActivityLog /> },
              { path: 'monitoring', element: <MonitoringDashboard /> },
              { path: 'profile', element: <DetailProfile /> },
            ],
          },
        ],
      },

      // ✅ Manager
      {
        element: <ProtectedRoute allowedGroups={[GroupRoleId.Manager]} />,
        children: [
          {
            path: '/manager',
            element: <ManagerLayout />,
            children: [
              { index: true, element: <DashboardManager /> },
              { path: 'dashboard', element: <DashboardManager /> },
              { path: 'approval', element: <ApprovalManager /> },
              { path: 'invitation', element: <InvitationManager /> },
              { path: 'parking', element: <ParkingManager /> },
              { path: 'visitor', element: <VisitorManager /> },
              { path: 'history', element: <HistoryManager /> },
              { path: 'report', element: <ReportManager /> },
              { path: 'profile', element: <DetailProfile /> },
            ],
          },
        ],
      },

      // ✅ Redirect unknown routes
      {
        path: '*',
        element: <Navigate to="/auth/404" replace />,
      },
    ],
  },
];

const router = createBrowserRouter(Router);
export default router;
