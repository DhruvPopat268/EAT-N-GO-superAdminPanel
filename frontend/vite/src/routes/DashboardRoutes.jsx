import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

const DashboardRoutes = {
  path: 'dashboard',
  children: [
    {
      path: 'default',
      element: <DashboardDefault />
    }
  ]
};

export default DashboardRoutes;