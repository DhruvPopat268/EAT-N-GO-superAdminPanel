const express = require('express');
const Permission = require('../models/Permission');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all permissions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const permissions = await Permission.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: permissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: error.message
    });
  }
});

// Create permission
router.post('/', authMiddleware, async (req, res) => {
  try {
    const permission = new Permission(req.body);
    await permission.save();
    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating permission',
      error: error.message
    });
  }
});

// Update permission
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Permission updated successfully',
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating permission',
      error: error.message
    });
  }
});

// Delete permission
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const permission = await Permission.findByIdAndDelete(req.params.id);
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting permission',
      error: error.message
    });
  }
});

module.exports = router;