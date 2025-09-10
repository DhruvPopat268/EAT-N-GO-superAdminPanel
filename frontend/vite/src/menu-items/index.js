import dashboard from './dashboard';
import pages from './pages';
import utilities from './utilities';
import restaurent from './restaurent';
import payments from './payments';
import orders from './orders';
import rbac from './rbac';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [dashboard, restaurent, orders, payments, rbac, utilities]
};

export default menuItems;