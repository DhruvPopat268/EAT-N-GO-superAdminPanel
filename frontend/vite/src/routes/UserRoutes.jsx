import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const UserManagement = Loadable(lazy(() => import('views/users/UserManagement')));
const UserDetail = Loadable(lazy(() => import('views/users/UserDetail')));

const UserRoutes = {
  path: 'user',
  children: [
    {
      path: 'management',
      element: <UserManagement />
    },
    {
      path: 'detail/:id',
      element: <UserDetail />
    }
  ]
};

export default UserRoutes;