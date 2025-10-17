const jwt = require('jsonwebtoken');
const RestaurantSession = require('../models/RestaurantSession');

const restaurantAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.RestaurantToken;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_RESTAURENT || 'your-secret-key');
    const session = await RestaurantSession.findOne({ token });
    
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session'
      });
    }

    req.restaurant = decoded;
    // req.token = token;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = restaurantAuthMiddleware;