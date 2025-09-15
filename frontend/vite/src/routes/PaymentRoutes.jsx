import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const WithdrawalRequests = Loadable(lazy(() => import('views/payments/WithdrawalRequests')));
const ApprovedWithdrawals = Loadable(lazy(() => import('views/payments/ApprovedWithdrawals')));
const RejectedWithdrawals = Loadable(lazy(() => import('views/payments/RejectedWithdrawals')));
const WithdrawalDetail = Loadable(lazy(() => import('views/payments/WithdrawalDetail')));
const Refunds = Loadable(lazy(() => import('views/payments/Refunds')));
const OrderPaymentHistory = Loadable(lazy(() => import('views/payments/OrderPaymentHistory')));
const TransactionHistory = Loadable(lazy(() => import('views/payments/TransactionHistory')));
const UPIManagement = Loadable(lazy(() => import('views/payments/UPIManagement')));

const PaymentRoutes = {
  path: 'payment',
  children: [
    {
      path: 'withdrawal-requests',
      element: <WithdrawalRequests />
    },
    {
      path: 'approved-withdrawals',
      element: <ApprovedWithdrawals />
    },
    {
      path: 'rejected-withdrawals',
      element: <RejectedWithdrawals />
    },
    {
      path: 'withdrawal-detail/:id',
      element: <WithdrawalDetail />
    },
    {
      path: 'refunds',
      element: <Refunds />
    },
    {
      path: 'order-payment-history',
      element: <OrderPaymentHistory />
    },
    {
      path: 'transaction-history',
      element: <TransactionHistory />
    },
    {
      path: 'upi-management',
      element: <UPIManagement />
    }
  ]
};

export default PaymentRoutes;