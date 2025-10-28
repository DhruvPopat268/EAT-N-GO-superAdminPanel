const express = require('express');
const Role = require('../models/Role');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all roles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const roles = await Role.find({ isActive: true }).populate('permissions').sort({ createdAt: -1 });
    
    // Add user count for each role
    const rolesWithUserCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.countDocuments({ role: role._id, isActive: true });
        return {
          ...role.toObject(),
          userCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: rolesWithUserCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message
    });
  }
});

// Create role
router.post('/', authMiddleware, async (req, res) => {
  try {
    const role = new Role(req.body);
    await role.save();
    await role.populate('permissions');
    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    });
  }
});

// Update role
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('permissions');
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message
    });
  }
});

// Delete role
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete system role'
      });
    }
    await Role.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting role',
      error: error.message
    });
  }
});

module.exports = router;