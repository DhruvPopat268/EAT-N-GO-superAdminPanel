import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
const RBACManagement = Loadable(lazy(() => import('views/rbac/RBACManagement')));
const SubscriptionManagement = Loadable(lazy(() => import('views/subscription/SubscriptionManagement')));
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

const UtilityRoutes = [
  {
    path: 'typography',
    element: <UtilsTypography />
  },
  {
    path: 'color',
    element: <UtilsColor />
  },
  {
    path: 'shadow',
    element: <UtilsShadow />
  },
  {
    path: 'rbac-management',
    element: <RBACManagement />
  },
  {
    path: 'subscription',
    element: <SubscriptionManagement />
  },
  {
    path: 'sample-page',
    element: <SamplePage />
  }
];

export default UtilityRoutes;