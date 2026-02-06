import { IconShoppingCartFilled, IconClipboardList } from '@tabler/icons-react';

const icons = { IconShoppingCartFilled, IconClipboardList };

const orders = {
  id: 'orders',
  title: 'Orders Management',
  type: 'group',
  children: [
    {
      id: 'order-requests',
      title: 'Order Requests Management',
      type: 'collapse',
      icon: icons.IconClipboardList,
      children: [
        {
          id: 'order-requests-all',
          title: 'All Order Requests',
          type: 'item',
          url: '/order-requests/all',
          breadcrumbs: false
        },
        {
          id: 'order-requests-pending',
          title: 'Pending',
          type: 'item',
          url: '/order-requests/pending',
          breadcrumbs: false
        },
        {
          id: 'order-requests-confirmed',
          title: 'Confirmed',
          type: 'item',
          url: '/order-requests/confirmed',
          breadcrumbs: false
        },
        {
          id: 'order-requests-waiting',
          title: 'Waiting',
          type: 'item',
          url: '/order-requests/waiting',
          breadcrumbs: false
        },
        {
          id: 'order-requests-completed',
          title: 'Completed',
          type: 'item',
          url: '/order-requests/completed',
          breadcrumbs: false
        },
        {
          id: 'order-requests-rejected',
          title: 'Rejected',
          type: 'item',
          url: '/order-requests/rejected',
          breadcrumbs: false
        },
        {
          id: 'order-requests-cancelled',
          title: 'Cancelled',
          type: 'item',
          url: '/order-requests/cancelled',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'orders-management',
      title: 'Orders Management',
      type: 'collapse',
      icon: icons.IconShoppingCartFilled,
      children: [
        {
          id: 'orders-all',
          title: 'All Orders',
          type: 'item',
          url: '/orders/all',
          breadcrumbs: false
        },
        {
          id: 'orders-confirmed',
          title: 'Confirmed Orders',
          type: 'item',
          url: '/orders/confirmed',
          breadcrumbs: false
        },
        {
          id: 'orders-preparing',
          title: 'Preparing Orders',
          type: 'item',
          url: '/orders/preparing',
          breadcrumbs: false
        },
        {
          id: 'orders-ready',
          title: 'Ready Orders',
          type: 'item',
          url: '/orders/ready',
          breadcrumbs: false
        },
        {
          id: 'orders-served',
          title: 'Served Orders',
          type: 'item',
          url: '/orders/served',
          breadcrumbs: false
        },
        {
          id: 'orders-completed',
          title: 'Completed Orders',
          type: 'item',
          url: '/orders/completed',
          breadcrumbs: false
        },
        {
          id: 'orders-cancelled',
          title: 'Cancelled Orders',
          type: 'item',
          url: '/orders/cancelled',
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default orders;