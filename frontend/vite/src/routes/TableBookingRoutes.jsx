import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const TableBookingConfig = Loadable(lazy(() => import('../views/table-booking/Configuration')));
const TableBookings = Loadable(lazy(() => import('../views/table-booking/Bookings')));
const BookingDetail = Loadable(lazy(() => import('../views/table-booking/BookingDetail')));

const TableBookingRoutes = {
  path: 'table-booking',
  children: [
    {
      path: 'configuration',
      element: <TableBookingConfig />
    },
    {
      path: 'bookings',
      element: <TableBookings />
    },
    {
      path: 'detail',
      element: <BookingDetail />
    }
  ]
};

export default TableBookingRoutes;