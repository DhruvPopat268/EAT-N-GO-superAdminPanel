import { IconUserShield } from '@tabler/icons-react';

const icons = { IconUserShield };

const rbac = {
  id: 'rbac',
  title: 'RBAC Management',
  type: 'group',
  children: [
    {
      id: 'rbac-management',
      title: 'RBAC Management',
      type: 'item',
      url: '/rbac-management',
      icon: icons.IconUserShield,
      breadcrumbs: false
    }
  ]
};

export default rbac;