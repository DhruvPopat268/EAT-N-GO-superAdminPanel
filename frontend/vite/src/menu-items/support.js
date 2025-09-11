import { IconHeadphones, IconMessageCircle } from '@tabler/icons-react';

const icons = { IconHeadphones, IconMessageCircle };

const support = {
  id: 'support',
  title: 'Help & Support',
  type: 'group',
  children: [
    {
      id: 'support-management',
      title: 'Help & Support',
      type: 'collapse',
      icon: icons.IconHeadphones,
      children: [
        {
          id: 'customer-chat',
          title: 'Customer Chat',
          type: 'item',
          url: '/support/customer-chat',
          icon: icons.IconMessageCircle
        }
      ]
    }
  ]
};

export default support;