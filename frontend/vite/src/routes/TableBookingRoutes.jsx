import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const TableBookingConfig = Loadable(lazy(() => import('../views/table-booking/Configuration')));

const TableBookingRoutes = {
  path: 'table-booking',
  children: [
    {
      path: 'configuration',
      element: <TableBookingConfig />
    }
  ]
};

export default TableBookingRoutes;