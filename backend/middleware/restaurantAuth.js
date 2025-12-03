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