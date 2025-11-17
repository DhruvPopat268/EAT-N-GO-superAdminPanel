const ActivityLog = require('../models/ActivityLog');
const User = require('../models/SuperAdmin');

const createLog = async (user, module, subModule, action, description = '', restroName = null, name = null) => {
  try {

    let userName = user.name;
    let userId = user._id || user.id;
    
    // If user name is not available, fetch from database
    if (!userName && userId) {
      const userFromDb = await User.findById(userId);
      userName = userFromDb?.name;
    }
    
    const logEntry = new ActivityLog({
      userId,
      userName,
      restroName,
      module,
      subModule,
      action,
      description,
      name
    });

    const savedLog = await logEntry.save();
    
    return savedLog;
  } catch (error) {
    console.error('Error creating activity log:', error);
    throw error;
  }
};

module.exports = createLog;