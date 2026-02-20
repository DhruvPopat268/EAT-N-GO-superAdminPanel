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
import coupons from './coupons';
import userRatings from './userRatings';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [
    dashboard,
    restaurent,
     orders,
    // payments,
    // customers,
    coupons,
    userRatings,
    rbac,
    activityLogs,
    // subscription,
    // support
  ]
};

export default menuItems;