// assets
import { IconKey, IconToolsKitchen2, IconChefHat, IconPlus } from '@tabler/icons-react';

// constant
const icons = {
    IconKey,
    IconToolsKitchen2,
    IconChefHat,
    IconPlus
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const restaurent = {
    id: 'restaurent',

    icon: icons.IconKey,
    title: 'Restaurent Management',
    type: 'group',
    children: [
        {
            id: 'restaurents',
            title: 'Restaurent Managemnt',
            type: 'collapse',
            icon: icons.IconToolsKitchen2,
            children: [
                {
                    id: 'OnboardingRequests',
                    title: 'onboarding Requests',
                    type: 'item',
                    url: '/restaurant/onboarding-requests',
                    // target: true
                },
                {
                    id: 'Onboarded',
                    title: 'Onboarded',
                    type: 'item',
                    url: '/restaurant/onboarded',
                    // target: true
                },
                {
                    id: 'Rejected',
                    title: 'rejected',
                    type: 'item',
                    url: '/restaurant/rejected',
                    // target: true
                },
                {
                    id: 'CostBreakdown',
                    title: 'Cost Breakdown',
                    type: 'item',
                    url: '/restaurant/cost-breakdown',
                    // target: true
                },
                {
                    id: 'AddRestaurant',
                    title: 'Add Restaurant',
                    type: 'item',
                    url: '/restaurant/add-restaurant',
                    // target: true
                }
            ]
        },
        {
            id: 'menu-management',
            title: 'Menu Management',
            type: 'collapse',
            icon: icons.IconChefHat,
            children: [
                {
                    id: 'add-menu-item',
                    title: 'Add Menu Item',
                    type: 'item',
                    url: '/restaurant/add-menu-item',
                   
                },
                {
                    id: 'menu-list',
                    title: 'Menu List',
                    type: 'item',
                    url: '/restaurant/menu-list',
                  
                }
            ]
        }
    ]
};

export default restaurent;
