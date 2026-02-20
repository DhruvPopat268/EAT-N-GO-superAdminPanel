import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const UserRatings = Loadable(lazy(() => import('views/user-ratings/UserRatings')));

const UserRatingRoutes = {
  path: 'user-ratings',
  element: <UserRatings />
};

export default UserRatingRoutes;
