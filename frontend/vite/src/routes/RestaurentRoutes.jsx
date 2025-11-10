import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const OnboardingRequestsPage = Loadable(lazy(() => import('../views/restaurent/OnboardingRequests')));
const OnboardedPage = Loadable(lazy(() => import('../views/restaurent/Onboarded')));
const RejectedPage = Loadable(lazy(() => import('../views/restaurent/Rejected')));
const RestaurantDetailPage = Loadable(lazy(() => import('../views/restaurent/RestaurantDetail')));
const CostBreakdown = Loadable(lazy(() => import('../views/restaurent/CostBreakdown')));
const AddMenuItem = Loadable(lazy(() => import('../views/restaurent/AddMenuItem')));
const MenuList = Loadable(lazy(() => import('../views/restaurent/MenuList')));
const AddRestaurant = Loadable(lazy(() => import('../views/restaurent/AddRestaurant')));
const SubcategoryManagement = Loadable(lazy(() => import('../views/restaurent/SubcategoryManagement')));
const AttributesManagement = Loadable(lazy(() => import('../views/restaurent/AttributesManagement')));
const AddonManagement = Loadable(lazy(() => import('../views/restaurent/AddonManagement')));
const ItemDetail = Loadable(lazy(() => import('../views/restaurent/ItemDetail')));

const RestaurentRoutes = {
  path: 'restaurant',
  children: [
    {
      path: 'onboarding-requests',
      element: <OnboardingRequestsPage />
    },
    {
      path: 'onboarded',
      element: <OnboardedPage />
    },
    {
      path: 'rejected',
      element: <RejectedPage />
    },
    {
      path: 'detail/:id',
      element: <RestaurantDetailPage />
    },
    {
      path: 'cost-breakdown',
      element: <CostBreakdown />
    },
    {
      path: 'add-menu-item',
      element: <AddMenuItem />
    },
    {
      path: 'menu-list',
      element: <MenuList />
    },
    {
      path: 'add-restaurant',
      element: <AddRestaurant />
    },
    {
      path: 'subcategory-management',
      element: <SubcategoryManagement />
    },
    {
      path: 'attributes-management',
      element: <AttributesManagement />
    },
    {
      path: 'addon-management',
      element: <AddonManagement />
    },
    {
      path: 'item-detail/:itemId',
      element: <ItemDetail />
    }
  ]
};

export default RestaurentRoutes;