import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MainLayout from 'layout/MainLayout';

// restaurant routing
const OnboardingRequestsPage = Loadable(lazy(() => import('../views/restaurent/OnboardingRequests')));
const OnboardedPage = Loadable(lazy(() => import('../views/restaurent/Onboarded')));
const RejectedPage = Loadable(lazy(() => import('../views/restaurent/Rejected')));
const RestaurantDetailPage = Loadable(lazy(() => import('../views/restaurent/RestaurantDetail')));
const CostBreakdown = Loadable(lazy(() => import('../views/restaurent/CostBreakdown')));


// ==============================|| RESTAURANT ROUTING ||============================== //

const RestaurentRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/restaurents/OnboardingRequests',
      element: <OnboardingRequestsPage />
    },
    {
      path: '/restaurents/Onboarded',
      element: <OnboardedPage />
    },
    {
      path: '/restaurents/Rejected',
      element: <RejectedPage />
    },
    {
      path: '/restaurant-detail/:id',
      element: <RestaurantDetailPage />
    },
    {
      path: '/restaurents/cost-breakdown',
      element: <CostBreakdown />
    },
  ]
};

export default RestaurentRoutes;