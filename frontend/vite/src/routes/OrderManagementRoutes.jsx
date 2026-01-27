import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';
import MainLayout from 'layout/MainLayout';

const AllOrders = Loadable(lazy(() => import('views/orders/AllOrders')));
const WaitingOrders = Loadable(lazy(() => import('views/orders/WaitingOrders')));
const ConfirmedOrders = Loadable(lazy(() => import('views/orders/ConfirmedOrders')));
const PreparingOrders = Loadable(lazy(() => import('views/orders/PreparingOrders')));
const ReadyOrders = Loadable(lazy(() => import('views/orders/ReadyOrders')));
const ServedOrders = Loadable(lazy(() => import('views/orders/ServedOrders')));
const CompletedOrders = Loadable(lazy(() => import('views/orders/CompletedOrders')));
const CancelledOrders = Loadable(lazy(() => import('views/orders/CancelledOrders')));
const OrderDetail = Loadable(lazy(() => import('views/orders/OrderDetail')));

const OrderManagementRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/orders/all',
      element: <AllOrders />
    },
    {
      path: '/orders/waiting',
      element: <WaitingOrders />
    },
    {
      path: '/orders/confirmed',
      element: <ConfirmedOrders />
    },
    {
      path: '/orders/preparing',
      element: <PreparingOrders />
    },
    {
      path: '/orders/ready',
      element: <ReadyOrders />
    },
    {
      path: '/orders/served',
      element: <ServedOrders />
    },
    {
      path: '/orders/completed',
      element: <CompletedOrders />
    },
    {
      path: '/orders/cancelled',
      element: <CancelledOrders />
    },
    {
      path: '/orders/detail/:id',
      element: <OrderDetail />
    }
  ]
};

export default OrderManagementRoutes;