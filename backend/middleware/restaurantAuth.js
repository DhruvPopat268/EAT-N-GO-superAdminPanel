const jwt = require('jsonwebtoken');
const RestaurantSession = require('../models/RestaurantSession');

const restaurantAuthMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies.RestaurantToken || (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
    
    // console.log('RestaurantToken:', token);
    
    // if (!token) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Access denied. No token provided.'
    //   });
    // }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_RESTAURENT || 'your-secret-key');
    // console.log('Decoded token:', decoded);
    
    const session = await RestaurantSession.findOne({ token });
    // console.log('Session found:', session ? 'Yes' : 'No');
    
    if (!session) {
      // console.log('No session found for token');
      return res.status(401).json({
        success: false,
        message: 'Invalid session - no session found for this token'
      });
    }

    req.restaurant = decoded;
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