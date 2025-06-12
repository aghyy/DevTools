const db = require("../models");
const Activity = db.activities;
const { Op } = require("sequelize");

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
    const limit = parseInt(req.query.limit) || 100; // Default limit for processing

    // Get all recent activities ordered by most recent first
    const allActivities = await Activity.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: limit, // Reasonable limit for recent activities
      attributes: { exclude: ['metadata'] }
    });

    return res.status(200).json(allActivities);
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get weekly activity data optimized for charts
const getWeeklyActivityData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Calculate date ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Current week: last 7 days
    const oneWeekAgo = new Date(startOfToday);
    oneWeekAgo.setDate(startOfToday.getDate() - 7);
    
    // Previous week: days 14-7 ago
    const twoWeeksAgo = new Date(startOfToday);
    twoWeeksAgo.setDate(startOfToday.getDate() - 14);
    
    // Get activities for both weeks
    const activities = await Activity.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: twoWeeksAgo
        }
      },
      attributes: ['createdAt'],
      order: [['createdAt', 'ASC']]
    });

    // Helper function to get date string in YYYY-MM-DD format
    const getDateString = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Helper function to get day abbreviation
    const getDayAbbreviation = (date) => {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    // Generate date arrays
    const currentWeekDates = [];
    const previousWeekDates = [];
    
    // Generate date strings for current week (last 7 days)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      currentWeekDates.push(getDateString(date));
    }
    
    // Generate date strings for previous week (days 14-7 ago)
    for (let i = 13; i >= 7; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      previousWeekDates.push(getDateString(date));
    }

    // Count activities by date
    const activityCounts = new Map();
    activities.forEach(activity => {
      const activityDate = new Date(activity.createdAt);
      const dateStr = getDateString(activityDate);
      activityCounts.set(dateStr, (activityCounts.get(dateStr) || 0) + 1);
    });

    // Build chart data
    const chartData = currentWeekDates.map((dateStr, index) => {
      const date = new Date(dateStr + 'T00:00:00');
      const previousDateStr = previousWeekDates[index];
      
      return {
        name: getDayAbbreviation(date),
        current: activityCounts.get(dateStr) || 0,
        previous: activityCounts.get(previousDateStr) || 0
      };
    });

    // Calculate totals and change
    const currentWeekTotal = chartData.reduce((sum, day) => sum + day.current, 0);
    const previousWeekTotal = chartData.reduce((sum, day) => sum + day.previous, 0);
    
    let change = 0;
    if (previousWeekTotal === 0 && currentWeekTotal > 0) {
      change = 100; // 100% increase from zero
    } else if (previousWeekTotal > 0) {
      change = ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;
    }

    return res.status(200).json({
      current: currentWeekTotal,
      change: Math.round(change * 100) / 100,
      data: chartData
    });
  } catch (error) {
    console.error("Error fetching weekly activity data:", error);
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
    
    const favoriteCount = await Activity.count({
      where: { 
        userId,
        type: 'favorite'
      }
    });
    
    const codeSnippetCount = await Activity.count({
      where: { 
        userId,
        type: 'codeSnippet'
      }
    });
    
    return res.status(200).json({
      tools: toolCount,
      bookmarks: bookmarkCount,
      favorites: favoriteCount,
      codeSnippets: codeSnippetCount,
      total: toolCount + bookmarkCount + favoriteCount + codeSnippetCount
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
  getWeeklyActivityData,
  getActivityStats,
  getMostUsedItems
}; 