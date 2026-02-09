const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');
const AdminSession = require('../models/AdminSession');
const { sendUserCredentials } = require('../services/emailService');
const authMiddleware = require('../middleware/auth');
const createLog = require('../utils/createLog');
const { getJwtConfig } = require('../utils/jwtConfig');
const router = express.Router();

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await SuperAdmin.findOne({ email, isActive: true }).populate('role');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check and manage session limit
    const maxSessions = parseInt(process.env.SUPER_ADMIN_ALLOWED_SESSIONS) || 1;
    const existingSessions = await AdminSession.find({ 
      userId: user._id 
    }).sort({ createdAt: 1 });

    if (existingSessions.length >= maxSessions) {
      // Delete oldest sessions to maintain limit
      const sessionsToDelete = existingSessions.slice(0, existingSessions.length - maxSessions + 1);
      await AdminSession.deleteMany({ 
        _id: { $in: sessionsToDelete.map(s => s._id) } 
      });
    }
    
    // Validate JWT configuration
    const { secret, expiry } = getJwtConfig('superadmin');
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      secret,
      { expiresIn: expiry }
    );
    
    // Create new session
    await AdminSession.create({
      email: user.email,
      token: token,
      userId: user._id
    });
    
    res.cookie('AdminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.eatngo.in' : undefined,
      maxAge: process.env.SUPER_ADMIN_COOKIE_MAX_AGE
    });
    
    await SuperAdmin.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Logout user
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await AdminSession.deleteOne({ token: req.token });
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Get all users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await SuperAdmin.find({ isActive: true })
      .populate('role')
      .select('-password')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Create user
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { password, ...userData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new SuperAdmin({
      ...userData,
      password: hashedPassword
    });
    await user.save();
    await user.populate('role');
    
    // Send credentials email
    try {
      // await sendUserCredentials(
      //   user.email,
      //   user.name,
      //   password,
      //   user.role.name
      // );
    } catch (emailError) {
      console.error('Failed to send credentials email:', emailError);
    }
    
    await createLog(
      req.user,
      'Role Management',
      'User',
      'create',
      `Created super admin "${user.name}"`,
      null,
      user.name
    );
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'SuperAdmin created successfully',
      data: userResponse
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Update user
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await SuperAdmin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('role').select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'SuperAdmin not found'
      });
    }
    
    await createLog(
      req.user,
      'Role Management',
      'User',
      'update',
      `Updated super admin "${user.name}"`,
      null,
      user.name
    );
    
    res.status(200).json({
      success: true,
      message: 'SuperAdmin updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// Delete user
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await SuperAdmin.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'SuperAdmin not found'
      });
    }
    
    await createLog(
      req.user,
      'Role Management',
      'User',
      'delete',
      `Deleted user "${user.name}"`,
      null,
      user.name
    );
    
    await SuperAdmin.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'SuperAdmin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

module.exports = router;