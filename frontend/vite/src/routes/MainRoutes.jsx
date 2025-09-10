import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// payments routing
const WithdrawalRequests = Loadable(lazy(() => import('views/payments/WithdrawalRequests')));
const ApprovedWithdrawals = Loadable(lazy(() => import('views/payments/ApprovedWithdrawals')));
const RejectedWithdrawals = Loadable(lazy(() => import('views/payments/RejectedWithdrawals')));
const WithdrawalDetail = Loadable(lazy(() => import('views/payments/WithdrawalDetail')));

// rbac routing
const RBACManagement = Loadable(lazy(() => import('views/rbac/RBACManagement')));

// orders routing
const OrdersManagement = Loadable(lazy(() => import('views/orders/OrdersManagement')));
const OrderDetail = Loadable(lazy(() => import('views/orders/OrderDetail')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'typography',
      element: <UtilsTypography />
    },
    {
      path: 'color',
      element: <UtilsColor />
    },
    {
      path: 'shadow',
      element: <UtilsShadow />
    },
    {
      path: '/payments/withdrawal-requests',
      element: <WithdrawalRequests />
    },
    {
      path: '/payments/approved-withdrawals',
      element: <ApprovedWithdrawals />
    },
    {
      path: '/payments/rejected-withdrawals',
      element: <RejectedWithdrawals />
    },
    {
      path: '/withdrawal-detail/:id',
      element: <WithdrawalDetail />
    },
    {
      path: '/rbac-management',
      element: <RBACManagement />
    },
    {
      path: '/orders-management',
      element: <OrdersManagement />
    },
    {
      path: '/order-detail/:id',
      element: <OrderDetail />
    },
    {
      path: '/sample-page',
      element: <SamplePage />
    }
  ]
};

export default MainRoutes;
