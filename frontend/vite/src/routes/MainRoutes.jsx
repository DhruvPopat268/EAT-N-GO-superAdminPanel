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

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  return isAuthenticated ? children : <Navigate to="/auth/login" replace />;
};

const RootRedirect = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  return isAuthenticated ? <Navigate to="/dashboard/default" replace /> : <Navigate to="/auth/login" replace />;
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
    ActivityLogRoutes,
    ...UtilityRoutes
  ]
};

export default MainRoutes;
