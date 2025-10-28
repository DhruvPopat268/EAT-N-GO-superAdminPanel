import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const ActivityLogs = Loadable(lazy(() => import('views/activity-logs/ActivityLogs')));

const ActivityLogRoutes = {
  path: '/activity-logs',
  element: <ActivityLogs />
};

export default ActivityLogRoutes;