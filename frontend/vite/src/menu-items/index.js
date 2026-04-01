import dashboard from './dashboard';
import pages from './pages';
// import utilities from './utilities';
import restaurent from './restaurent';
import tableBooking from './tableBooking';
import payments from './payments';
import orders from './orders';
import rbac from './rbac';
import subscription from './subscription';
import users from './users';
import support from './support';
import activityLogs from './activityLogs';
import coupons from './coupons';
import userRatings from './userRatings';
import adminWallet from './adminWallet';
import restaurantWallet from './restaurantWallet';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [
    dashboard,
    restaurent,
    tableBooking,
     orders,
    // payments,
    adminWallet,
    restaurantWallet,
    users,
    coupons,
    userRatings,
    rbac,
    activityLogs,
    // subscription,
    // support
  ]
};

export default menuItems;