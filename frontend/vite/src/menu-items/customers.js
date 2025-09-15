import { IconUsers } from '@tabler/icons-react';

const icons = { IconUsers };

const customers = {
  id: 'customers',
  title: 'Customer Management',
  type: 'group',
  children: [
    {
      id: 'customers-management',
      title: 'Customer Management',
      type: 'item',
      url: '/customer/management',
      icon: icons.IconUsers,
      breadcrumbs: false
    }
  ]
};

export default customers;