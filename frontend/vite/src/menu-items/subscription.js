import { IconCreditCard } from '@tabler/icons-react';

const icons = { IconCreditCard };

const subscription = {
  id: 'subscription',
  title: 'Subscription Management',
  type: 'group',
  children: [
    {
      id: 'subscription-management',
      title: 'Subscription Plans',
      type: 'item',
      url: '/subscription',
      icon: icons.IconCreditCard,
      breadcrumbs: false
    }
  ]
};

export default subscription;