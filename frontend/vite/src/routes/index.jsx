import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import RestaurentRoutes from './RestaurentRoutes';
import MainRoutes from './MainRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([MainRoutes, AuthenticationRoutes , RestaurentRoutes], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;