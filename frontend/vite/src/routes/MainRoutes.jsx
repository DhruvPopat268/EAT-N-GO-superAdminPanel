import { Navigate } from 'react-router-dom';
import MainLayout from 'layout/MainLayout';
import DashboardRoutes from './DashboardRoutes';
import PaymentRoutes from './PaymentRoutes';
import OrderRoutes, { OrderRequestRoutes, OrderManagementRoutes } from './OrderRoutes';
import CustomerRoutes from './CustomerRoutes';
import SupportRoutes from './SupportRoutes';
import UtilityRoutes from './UtilityRoutes';
import RestaurentRoutes from './RestaurentRoutes';
import ActivityLogRoutes from './ActivityLogRoutes';
import CouponRoutes from './CouponRoutes';

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
    CustomerRoutes,
    SupportRoutes,
    RestaurentRoutes,
    CouponRoutes,
    ActivityLogRoutes,
    ...UtilityRoutes
  ]
};

export default MainRoutes;
