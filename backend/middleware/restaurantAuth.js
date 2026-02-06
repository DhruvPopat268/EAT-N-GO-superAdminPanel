const jwt = require('jsonwebtoken');
const RestaurantSession = require('../models/RestaurantSession');
const Restaurent = require('../models/Restaurant');

const restaurantAuthMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies.RestaurantToken || (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET_RESTAURENT || 'your-secret-key');
   
    const session = await RestaurantSession.findOne({ token });
   
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session - no session found for this token'
      });
    }

    // Check if session limit is exceeded and clean up if needed
    const maxSessions = parseInt(process.env.RESTAURANT_ALLOWED_SESSIONS) || 1;
    const activeSessions = await RestaurantSession.countDocuments({ 
      restaurantId: decoded.restaurantId 
    });

    if (activeSessions > maxSessions) {
      // Get oldest sessions to delete
      const sessions = await RestaurantSession.find({ 
        restaurantId: decoded.restaurantId 
      }).sort({ createdAt: 1 });
      
      const sessionsToDelete = sessions.slice(0, activeSessions - maxSessions);
      await RestaurantSession.deleteMany({ 
        _id: { $in: sessionsToDelete.map(s => s._id) } 
      });
      
      // Check if current session was deleted
      if (sessionsToDelete.some(s => s.token === token)) {
        return res.status(401).json({
          success: false,
          message: 'Session expired due to new login from another device'
        });
      }
    }

    req.restaurant = decoded;
    
    const restaurant = await Restaurent.findById(decoded.restaurantId);

    if (!restaurant) {
      return res.status(401).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    req.restaurantDetails = restaurant;

    next();
  } catch (error) {
    console.error('Restaurant auth middleware error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid token: ' + error.message
    });
  }
};

module.exports = restaurantAuthMiddleware;