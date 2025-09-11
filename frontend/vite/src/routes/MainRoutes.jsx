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
const Refunds = Loadable(lazy(() => import('views/payments/Refunds')));
const OrderPaymentHistory = Loadable(lazy(() => import('views/payments/OrderPaymentHistory')));
const TransactionHistory = Loadable(lazy(() => import('views/payments/TransactionHistory')));
const UPIManagement = Loadable(lazy(() => import('views/payments/UPIManagement')));

// support routing
const CustomerChat = Loadable(lazy(() => import('views/support/CustomerChat')));

// restaurant routing
const AddRestaurant = Loadable(lazy(() => import('views/restaurent/AddRestaurant')));

// rbac routing
const RBACManagement = Loadable(lazy(() => import('views/rbac/RBACManagement')));

// orders routing
const OrdersManagement = Loadable(lazy(() => import('views/orders/OrdersManagement')));
const OrderDetail = Loadable(lazy(() => import('views/orders/OrderDetail')));

// subscription routing
const SubscriptionManagement = Loadable(lazy(() => import('views/subscription/SubscriptionManagement')));

// customers routing
const CustomerManagement = Loadable(lazy(() => import('views/customers/CustomerManagement')));
const CustomerDetail = Loadable(lazy(() => import('views/customers/CustomerDetail')));

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
      path: '/payments/refunds',
      element: <Refunds />
    },
    {
      path: '/payments/order-payment-history',
      element: <OrderPaymentHistory />
    },
    {
      path: '/payments/transaction-history',
      element: <TransactionHistory />
    },
    {
      path: '/payments/upi-management',
      element: <UPIManagement />
    },
    {
      path: '/support/customer-chat',
      element: <CustomerChat />
    },
    {
      path: '/restaurents/add-restaurant',
      element: <AddRestaurant />
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
      path: '/subscription',
      element: <SubscriptionManagement />
    },
    {
      path: '/customers',
      element: <CustomerManagement />
    },
    {
      path: '/customer-detail/:id',
      element: <CustomerDetail />
    },
    {
      path: '/sample-page',
      element: <SamplePage />
    }
  ]
};

export default MainRoutes;
