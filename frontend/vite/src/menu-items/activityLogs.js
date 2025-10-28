// assets
import { IconHistory } from '@tabler/icons-react';

// constant
const icons = {
  IconHistory
};

// ==============================|| ACTIVITY LOGS MENU ITEMS ||============================== //

const activityLogs = {
  id: 'activity-logs',
  title: 'Activity Logs',
  type: 'group',
  children: [
    {
      id: 'activity-logs-list',
      title: 'Activity Logs',
      type: 'item',
      url: '/activity-logs',
      icon: icons.IconHistory,
      breadcrumbs: false
    }
  ]
};

export default activityLogs;