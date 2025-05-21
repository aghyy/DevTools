const db = require("../models");
const Activity = db.activities;

// Track user activity
const trackActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, name, path, icon, metadata } = req.body;

    if (!type || !name || !path) {
      return res.status(400).json({ message: "Type, name, and path are required" });
    }

    // Create activity record
    const activity = await Activity.create({
      userId,
      type,
      name,
      path,
      icon: icon || 'Activity', // Default icon
      metadata: metadata || null
    });

    return res.status(201).json({ 
      message: "Activity tracked successfully",
      activity
    });
  } catch (error) {
    console.error("Error tracking activity:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get user activity
const getUserActivities = async (req, res) => {
  try {
    const userId = req.user.id;

    // First get all recent activities
    const allActivities = await Activity.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['metadata'] }
    });
    
    // Manual deduplication by path and day
    const uniquePathsAndDays = new Set();
    const deduplicated = [];
    
    for (const activity of allActivities) {
      // Extract the date part from createdAt (YYYY-MM-DD)
      const day = activity.createdAt.toISOString().split('T')[0];
      const pathDayKey = `${activity.path}-${day}`;
      
      if (!uniquePathsAndDays.has(pathDayKey)) {
        uniquePathsAndDays.add(pathDayKey);
        deduplicated.push(activity);
      }
    }

    return res.status(200).json(deduplicated);
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get activity counts
const getActivityStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Count by type
    const toolCount = await Activity.count({
      where: { 
        userId,
        type: 'tool'
      }
    });
    
    const bookmarkCount = await Activity.count({
      where: { 
        userId,
        type: 'bookmark'
      }
    });
    
    return res.status(200).json({
      tools: toolCount,
      bookmarks: bookmarkCount,
      total: toolCount + bookmarkCount
    });
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get most used items
const getMostUsedItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;
    const days = parseInt(req.query.days) || 30; // Default to last 30 days
    
    // Get the date for filtering (x days ago)
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - days);
    
    // Raw SQL query to ensure proper counting
    const results = await db.sequelize.query(`
      SELECT
        name, 
        path, 
        type, 
        icon, 
        COUNT(*) as count
      FROM activities
      WHERE 
        "userId" = :userId AND
        "createdAt" >= :dateFilter
      GROUP BY name, path, type, icon
      ORDER BY count DESC
      LIMIT :limit
    `, {
      replacements: {
        userId,
        dateFilter,
        limit
      },
      type: db.Sequelize.QueryTypes.SELECT
    });

    // Parse counts to integers
    const formattedResults = results.map(item => ({
      ...item,
      count: parseInt(item.count, 10)
    }));
    
    return res.status(200).json(formattedResults);
  } catch (error) {
    console.error("Error fetching most used items:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  trackActivity,
  getUserActivities,
  getActivityStats,
  getMostUsedItems
}; 