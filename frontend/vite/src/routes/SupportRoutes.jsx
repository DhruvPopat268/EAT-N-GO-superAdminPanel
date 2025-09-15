import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const CustomerChat = Loadable(lazy(() => import('views/support/CustomerChat')));

const SupportRoutes = {
  path: 'support',
  children: [
    {
      path: 'customer-chat',
      element: <CustomerChat />
    }
  ]
};

export default SupportRoutes;