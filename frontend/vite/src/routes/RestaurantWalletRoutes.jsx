import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const RestaurantWalletTransactions = Loadable(lazy(() => import('views/adminWallet/RestaurantWalletTransactions')));

const RestaurantWalletRoutes = {
  path: 'restaurant-wallet',
  children: [
    {
      path: 'transactions',
      element: <RestaurantWalletTransactions />
    }
  ]
};

export default RestaurantWalletRoutes;
