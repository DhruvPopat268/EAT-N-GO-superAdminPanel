import { IconTicket } from '@tabler/icons-react';

const icons = { IconTicket };

const coupons = {
  id: 'coupons',
  icon: icons.IconTicket,
  title: 'Coupon Management',
  type: 'group',
  children: [
    {
      id: 'coupon-management',
      title: 'Coupons',
      type: 'item',
      icon: icons.IconTicket,
      url: '/coupons/management'
    }
  ]
};

export default coupons;
