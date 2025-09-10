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
    type: 'group',
    children: [
        {
            id: 'restaurents',
            title: 'Restaurents',
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
                }
            ]
        }
    ]
};

export default restaurent;
