const jwt = require('jsonwebtoken');
const AdminSession = require('../models/AdminSession');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.AdminToken;
    console.log("Auth Middleware Token:", token);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_SUPERADMIN || 'your-secret-key');
    
    const session = await AdminSession.findOne({ token, email: decoded.email });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. Please login again.'
      });
    }

    const user = await User.findById(decoded.userId).populate('role');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive.'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

module.exports = authMiddleware;