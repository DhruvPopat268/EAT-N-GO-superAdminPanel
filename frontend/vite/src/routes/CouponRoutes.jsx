import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const CouponManagement = Loadable(lazy(() => import('../views/coupons/CouponManagement')));

const CouponRoutes = {
  path: 'coupons',
  children: [
    {
      path: 'management',
      element: <CouponManagement />
    }
  ]
};

export default CouponRoutes;
