import { Navigate } from 'react-router-dom';
import MainLayout from 'layout/MainLayout';
import DashboardRoutes from './DashboardRoutes';
import PaymentRoutes from './PaymentRoutes';
import OrderRoutes, { OrderRequestRoutes, OrderManagementRoutes } from './OrderRoutes';
import SupportRoutes from './SupportRoutes';
import UtilityRoutes from './UtilityRoutes';
import RestaurentRoutes from './RestaurentRoutes';
import TableBookingRoutes from './TableBookingRoutes';
import ActivityLogRoutes from './ActivityLogRoutes';
import CouponRoutes from './CouponRoutes';
import UserRatingRoutes from './UserRatingRoutes';
import UserRoutes from './UserRoutes';
import TestRoutes from './TestRoutes';
import AdminWalletRoutes from './AdminWalletRoutes';
import RestaurantWalletRoutes from './RestaurantWalletRoutes';

const ProtectedRoute = ({ children }) => {
  return children;
};

const RootRedirect = () => {
  return <Navigate to="/dashboard/default" replace />;
};

const MainRoutes = {
  path: '/',
  element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
  children: [
    {
      path: '/',
      element: <RootRedirect />
    },
    DashboardRoutes,
    PaymentRoutes,
    OrderRequestRoutes,
    OrderRoutes,
    OrderManagementRoutes,
    SupportRoutes,
    RestaurentRoutes,
    TableBookingRoutes,
    CouponRoutes,
    ActivityLogRoutes,
    UserRatingRoutes,
    UserRoutes,
    AdminWalletRoutes,
    RestaurantWalletRoutes,
    TestRoutes,
    ...UtilityRoutes
  ]
};

export default MainRoutes;
