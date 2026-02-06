import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const OrdersManagement = Loadable(lazy(() => import('views/orders/OrdersManagement')));
const OrderDetail = Loadable(lazy(() => import('views/orders/OrderDetail')));
const AllOrderRequests = Loadable(lazy(() => import('views/orders/AllOrderRequests')));
const PendingOrderRequests = Loadable(lazy(() => import('views/orders/PendingOrderRequests')));
const ConfirmedOrderRequests = Loadable(lazy(() => import('views/orders/ConfirmedOrderRequests')));
const WaitingOrderRequests = Loadable(lazy(() => import('views/orders/WaitingOrderRequests')));
const CompletedOrderRequests = Loadable(lazy(() => import('views/orders/CompletedOrderRequests')));
const RejectedOrderRequests = Loadable(lazy(() => import('views/orders/RejectedOrderRequests')));
const CancelledOrderRequests = Loadable(lazy(() => import('views/orders/CancelledOrderRequests')));
const OrderRequestDetail = Loadable(lazy(() => import('views/orders/OrderRequestDetail')));

// Order Management Components
const AllOrders = Loadable(lazy(() => import('views/orders/AllOrders')));
const ConfirmedOrders = Loadable(lazy(() => import('views/orders/ConfirmedOrders')));
const PreparingOrders = Loadable(lazy(() => import('views/orders/PreparingOrders')));
const ReadyOrders = Loadable(lazy(() => import('views/orders/ReadyOrders')));
const ServedOrders = Loadable(lazy(() => import('views/orders/ServedOrders')));
const CompletedOrders = Loadable(lazy(() => import('views/orders/CompletedOrders')));
const CancelledOrders = Loadable(lazy(() => import('views/orders/CancelledOrders')));

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

const OrderManagementRoutes = {
  path: 'orders',
  children: [
    {
      path: 'all',
      element: <AllOrders />
    },
    {
      path: 'confirmed',
      element: <ConfirmedOrders />
    },
    {
      path: 'preparing',
      element: <PreparingOrders />
    },
    {
      path: 'ready',
      element: <ReadyOrders />
    },
    {
      path: 'served',
      element: <ServedOrders />
    },
    {
      path: 'completed',
      element: <CompletedOrders />
    },
    {
      path: 'cancelled',
      element: <CancelledOrders />
    },
    {
      path: 'detail/:id',
      element: <OrderDetail />
    }
  ]
};

const OrderRequestRoutes = {
  path: 'order-requests',
  children: [
    {
      path: 'all',
      element: <AllOrderRequests />
    },
    {
      path: 'pending',
      element: <PendingOrderRequests />
    },
    {
      path: 'confirmed',
      element: <ConfirmedOrderRequests />
    },
    {
      path: 'waiting',
      element: <WaitingOrderRequests />
    },
    {
      path: 'completed',
      element: <CompletedOrderRequests />
    },
    {
      path: 'rejected',
      element: <RejectedOrderRequests />
    },
    {
      path: 'cancelled',
      element: <CancelledOrderRequests />
    },
    {
      path: 'detail/:id',
      element: <OrderRequestDetail />
    }
  ]
};

export { OrderRoutes, OrderRequestRoutes, OrderManagementRoutes };
export default OrderRoutes;