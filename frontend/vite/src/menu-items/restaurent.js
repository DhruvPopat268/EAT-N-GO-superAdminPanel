// assets
import { IconKey, IconToolsKitchen2 } from '@tabler/icons-react';

// constant
const icons = {
    IconKey,
    IconToolsKitchen2
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
                    url: '/restaurents/OnboardingRequests',
                    // target: true
                },
                {
                    id: 'Onboarded',
                    title: 'Onboarded',
                    type: 'item',
                    url: '/restaurents/Onboarded',
                    // target: true
                },
                {
                    id: 'Rejected',
                    title: 'rejected',
                    type: 'item',
                    url: '/restaurents/Rejected',
                    // target: true
                },
                {
                    id: 'CostBreakdown',
                    title: 'Cost Breakdown',
                    type: 'item',
                    url: '/restaurents/cost-breakdown',
                    // target: true
                },
                {
                    id: 'AddRestaurant',
                    title: 'Add Restaurant',
                    type: 'item',
                    url: '/restaurents/add-restaurant',
                    // target: true
                }
            ]
        }
    ]
};

export default restaurent;
