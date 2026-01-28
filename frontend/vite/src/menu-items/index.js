import dashboard from './dashboard';
import pages from './pages';
// import utilities from './utilities';
import restaurent from './restaurent';
import payments from './payments';
import orders from './orders';
import rbac from './rbac';
import subscription from './subscription';
import customers from './customers';
import support from './support';
import activityLogs from './activityLogs';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [
    dashboard,
    restaurent,
     orders,
    // payments,
    // customers,
    rbac,
    activityLogs,
    // subscription,
    // support
  ]
};

export default menuItems;