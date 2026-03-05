import { IconUsers } from '@tabler/icons-react';

const icons = { IconUsers };

const users = {
  id: 'users',
  title: 'User Management',
  type: 'group',
  children: [
    {
      id: 'users-management',
      title: 'User Management',
      type: 'item',
      url: '/user/management',
      icon: icons.IconUsers,
      breadcrumbs: false
    }
  ]
};

export default users;