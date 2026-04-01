import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const AdminWalletTransactions = Loadable(lazy(() => import('views/adminWallet/AdminWalletTransactions')));

const AdminWalletRoutes = {
  path: 'admin-wallet',
  children: [
    {
      path: 'transactions',
      element: <AdminWalletTransactions />
    }
  ]
};

export default AdminWalletRoutes;
