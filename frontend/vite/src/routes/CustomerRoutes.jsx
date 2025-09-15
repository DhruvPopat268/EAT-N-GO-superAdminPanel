import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const CustomerManagement = Loadable(lazy(() => import('views/customers/CustomerManagement')));
const CustomerDetail = Loadable(lazy(() => import('views/customers/CustomerDetail')));

const CustomerRoutes = {
  path: 'customer',
  children: [
    {
      path: 'management',
      element: <CustomerManagement />
    },
    {
      path: 'detail/:id',
      element: <CustomerDetail />
    }
  ]
};

export default CustomerRoutes;