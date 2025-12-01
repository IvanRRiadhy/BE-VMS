// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Loadable from 'src/layouts/full/shared/loadable/Loadable';
import { ProtectedRoute } from 'src/customs/contexts/ProtectedRoute';
import { GroupRoleId } from '../constant/GroupRoleId';
import AuthRedirector from './AuthRedirector';

/* ***Layouts**** */
const GuestLayout = Loadable(lazy(() => import('src/customs/pages/Guest/GuestLayout')));
const EmployeeLayout = Loadable(lazy(() => import('src/customs/pages/Employee/EmployeeLayout')));
const OperatorLayout = Loadable(lazy(() => import('src/customs/pages/Operator/OperatorLayout')));
const ManagerLayout = Loadable(lazy(() => import('src/customs/pages/Manager/ManagerLayout')));
const BlankLayout = Loadable(lazy(() => import('src/layouts/blank/BlankLayout')));

/* ****AUTH & COMMON PAGES***** */
const Login2 = Loadable(lazy(() => import('src/views/authentication/auth2/Login2')));
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

/* ****GUEST PAGES**** */
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

/* ****ADMIN PAGES**** */
const Dashboard = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_dashboard/Content')),
);
const ManageVisitor = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_visitor/Content')),
);
const ManageCompanyAndDepartment = Loadable(
  lazy(
    () => import('src/customs/pages/admin/content/content_manage_company_and_department/Content'),
  ),
);
const ManageEmployee = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_employee/Content')),
);
const ManageSiteSpace = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_site_space/Content')),
);
const ManageVisitorCard = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_visitor_card/Content')),
);
// const ManageDeviceKiosk = Loadable(lazy(() => import('src/customs/pages/admin/ManageDeviceKiosk')));

const ManageDocument = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_document/Content')),
);
const ManageBrand = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_brand/Content')),
);
const SettingUser = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_setting_user/Content')),
);
const FormAddUser = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_setting_user/FormAddUser')),
);
const ManageVisitorType = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_visitor_type/Content')),
);
const ManageIntegration = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_integration/Content')),
);
const ManageIntegrationDetail = Loadable(
  lazy(() => import('src/customs/pages/admin/ManageIntegrationDetail')),
);
const ManageAccessControl = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_access_control/Content')),
);
const ManageCustomField = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_custom_field/Content')),
);
const ManageSettingSmtp = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_setting_smtp/Content')),
);
// const ManageGroupCardAccess = Loadable(
//   lazy(() => import('src/customs/pages/admin/ManageGroupCardAccess')),
// );
const ManageTimezone = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_timezone/Context')),
);
const ManageSettingVisitor = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_setting_visitor/Content')),
);
const ManageDelivery = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_delivery/Driver/Content')),
);
const ManageDeliveryScheduler = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_delivery/Schduler/Content')),
);
const ManageDeliveryVisit = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_manage_delivery/Visit/Content')),
);
const ManageDetailScheduler = Loadable(
  lazy(
    () => import('src/customs/pages/admin/content/content_manage_delivery/Schduler/DetailSchduler'),
  ),
);
const ManageUser = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_user/Content')),
);
const ManageReport = Loadable(
  lazy(() => import('src/customs/pages/admin/content/content_report/Content')),
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

/* ****OPERATOR PAGES**** */
const DashboardOperator = Loadable(lazy(() => import('src/customs/pages/Operator/Dashboard')));
const OperatorView = Loadable(lazy(() => import('src/customs/pages/Operator/OperatorView')));

/* ****MANAGER PAGES**** */
const DashboardManager = Loadable(lazy(() => import('src/customs/pages/Manager/Dashboard')));
const ApprovalManager = Loadable(lazy(() => import('src/customs/pages/Manager/Approval')));
const ParkingManager = Loadable(lazy(() => import('src/customs/pages/Manager/Parking')));
const InvitationManager = Loadable(lazy(() => import('src/customs/pages/Manager/Invitation')));
const VisitorManager = Loadable(lazy(() => import('src/customs/pages/Manager/Visitor')));
const HistoryManager = Loadable(lazy(() => import('src/customs/pages/Manager/History')));
const ReportManager = Loadable(lazy(() => import('src/customs/pages/Manager/Report')));

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
    //       { path: '/auth/login', element: <Login2 /> },
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
              { path: '/auth/login', element: <Login2 /> },
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
              { path: 'parking', element: <Parking /> },
              { path: 'alarm', element: <AlarmPage /> },
              { path: 'evacuate', element: <Evacuate /> },
              { path: 'visitor', element: <Visitor /> },
              { path: 'profile', element: <DetailProfile /> },
            ],
          },
        ],
      },

      // ✅ Admin routes
      {
        element: <ProtectedRoute allowedGroups={[GroupRoleId.Admin]} />,
        children: [
          { path: '/admin/dashboard', element: <Dashboard /> },
          { path: '/admin/visitor', element: <ManageVisitor /> },
          // { path: '/admin/visitor/list-visitor', element: <ManageVisitor /> },
          // { path: '/admin/visitor/transaction-visitor', element: <ManageVisitor /> },
          { path: '/admin/manage/companys-deparments', element: <ManageCompanyAndDepartment /> },
          { path: '/admin/manage/employees', element: <ManageEmployee /> },
          { path: '/admin/manage/delivery', element: <ManageDelivery /> },
          { path: '/admin/manage/delivery/staff', element: <ManageDelivery /> },
          { path: '/admin/manage/delivery/scheduler', element: <ManageDeliveryScheduler /> },
          {
            path: '/admin/manage/delivery/scheduler/detail/:id',
            element: <ManageDetailScheduler />,
          },
          { path: '/admin/manage/delivery/visit', element: <ManageDeliveryVisit /> },
          { path: '/admin/manage/site-space', element: <ManageSiteSpace /> },
          { path: '/admin/manage/card', element: <ManageVisitorCard /> },

          { path: '/admin/manage/timezone', element: <ManageTimezone /> },
          { path: '/admin/manage/visitor-type', element: <ManageVisitorType /> },
          // { path: '/admin/manage/device-kiosk', element: <ManageDeviceKiosk /> },
          { path: '/admin/manage/document', element: <ManageDocument /> },
          { path: '/admin/manage/brand', element: <ManageBrand /> },
          { path: '/admin/manage/integration', element: <ManageIntegration /> },
          { path: '/admin/manage/integration/:id', element: <ManageIntegrationDetail /> },
          { path: '/admin/manage/access-control', element: <ManageAccessControl /> },
          { path: '/admin/manage/custom-field', element: <ManageCustomField /> },
          { path: '/admin/manage/setting-smtp', element: <ManageSettingSmtp /> },
          { path: '/admin/settings', element: <ManageSettingVisitor /> },
          { path: '/admin/setting/users', element: <SettingUser /> },
          { path: '/admin/setting/users/add-user', element: <FormAddUser /> },
          { path: '/admin/user', element: <ManageUser /> },
          { path: '/admin/report', element: <ManageReport /> },
          { path: '/profile', element: <DetailProfile /> },
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
              { path: 'visitor', element: <VisitorEmployee /> },
              { path: 'history', element: <HistoryEmployee /> },
              { path: 'profile', element: <ProfileEmployee /> },
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
