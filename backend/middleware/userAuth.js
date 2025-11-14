const jwt = require('jsonwebtoken');
const UserSession = require('../usersModels/userSession');

const generateToken = (mobileNo, userId) => {
  return jwt.sign({ mobileNo, userId }, process.env.JWT_SECRET_USER , { expiresIn: '30d' });
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER || 'secret');
    const session = await UserSession.findOne({ mobileNo: decoded.mobileNo, token });
    
    if (!session) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    req.user = decoded;
    console.log("Decoded user:", decoded);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { generateToken, verifyToken };