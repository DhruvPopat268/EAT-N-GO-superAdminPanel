const jwt = require('jsonwebtoken');
const UserSession = require('../usersModels/userSession');

const generateTokens = (mobileNo, userId) => {
  const accessToken = jwt.sign({ mobileNo, userId }, process.env.JWT_SECRET_ACCESS_TOKEN_USER, { expiresIn: process.env.JWT_ACCESS_TOKEN_USER_EXPIRY });
  const refreshToken = jwt.sign({ mobileNo, userId }, process.env.JWT_SECRET_REFRESH_TOKEN_USER, { expiresIn: process.env.JWT_REFRESH_TOKEN_USER_EXPIRY });
  return { accessToken, refreshToken };
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied', code: 'NO_TOKEN' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN_USER);
    const session = await UserSession.findOne({ userId: decoded.userId, accessToken: token });
    
    if (!session) {
      return res.status(401).json({ message: 'Invalid session', code: 'INVALID_SESSION' });
    }

    // Check if refresh token is still valid
    try {
      jwt.verify(session.refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN_USER);
    } catch (refreshError) {
      // Refresh token expired - user needs to logout
      return res.status(401).json({ message: 'Session expired', code: 'REFRESH_TOKEN_EXPIRED' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired', code: 'ACCESS_TOKEN_EXPIRED' });
    }
    res.status(401).json({ message: 'Invalid token', code: 'INVALID_TOKEN' });
  }
};

module.exports = { generateTokens, verifyToken };