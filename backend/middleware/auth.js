const jwt = require('jsonwebtoken');
const AdminSession = require('../models/AdminSession');
const User = require('../models/SuperAdmin');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.AdminToken || (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_SUPERADMIN || 'your-secret-key');
    console.log('Decoded token:', decoded);
    
    const session = await AdminSession.findOne({ token, email: decoded.email });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. Please login again.'
      });
    }

    // Check if session limit is exceeded and clean up if needed
    const maxSessions = parseInt(process.env.SUPER_ADMIN_ALLOWED_SESSIONS) || 1;
    const activeSessions = await AdminSession.countDocuments({ 
      userId: decoded.userId 
    });

    if (activeSessions > maxSessions) {
      // Get oldest sessions to delete
      const sessions = await AdminSession.find({ 
        userId: decoded.userId 
      }).sort({ createdAt: 1 });
      
      const sessionsToDelete = sessions.slice(0, activeSessions - maxSessions);
      await AdminSession.deleteMany({ 
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

    const user = await User.findById(decoded.userId).populate('role');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive.'
      });
    }

    req.user = user;
    console.log('Auth successful for userId:', req.user);
    
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