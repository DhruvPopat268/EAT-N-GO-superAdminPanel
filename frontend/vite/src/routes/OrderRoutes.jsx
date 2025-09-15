import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const OrdersManagement = Loadable(lazy(() => import('views/orders/OrdersManagement')));
const OrderDetail = Loadable(lazy(() => import('views/orders/OrderDetail')));

const OrderRoutes = {
  path: 'order',
  children: [
    {
      path: 'management',
      element: <OrdersManagement />
    },
    {
      path: 'detail/:id',
      element: <OrderDetail />
    }
  ]
};

export default OrderRoutes;