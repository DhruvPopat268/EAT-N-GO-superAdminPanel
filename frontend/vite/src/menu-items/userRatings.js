import { IconStar } from '@tabler/icons-react';

const icons = { IconStar };

const userRatings = {
  id: 'user-ratings',
  title: 'User Ratings Management',
  type: 'group',
  children: [
    {
      id: 'user-ratings-list',
      title: 'User Ratings',
      type: 'item',
      icon: icons.IconStar,
      url: '/user-ratings',
      breadcrumbs: false
    }
  ]
};

export default userRatings;
