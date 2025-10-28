const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all activity logs with filtering
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { module, subModule, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (module) filter.module = module;
    if (subModule) filter.subModule = subModule;

    const logs = await ActivityLog.find(filter)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalLogs: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs',
      error: error.message
    });
  }
});

// Get unique modules and submodules for filters
router.get('/filters', authMiddleware, async (req, res) => {
  try {
    const modules = await ActivityLog.distinct('module');
    const subModules = await ActivityLog.distinct('subModule');

    res.status(200).json({
      success: true,
      data: {
        modules,
        subModules
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching filter options',
      error: error.message
    });
  }
});

module.exports = router;