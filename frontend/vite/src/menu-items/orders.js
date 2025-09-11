import { IconShoppingCartFilled } from '@tabler/icons-react';

const icons = { IconShoppingCartFilled };

const orders = {
  id: 'orders',
  title: 'Orders Management',
  type: 'group',
  children: [
    {
      id: 'orders-management',
      title: 'Orders Management',
      type: 'item',
      url: '/orders-management',
      icon: icons.IconShoppingCartFilled,
      breadcrumbs: false
    }
  ]
};

export default orders;