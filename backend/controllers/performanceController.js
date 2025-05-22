const db = require("../models");
const PerformanceMetric = db.performanceMetrics;
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

// Record a performance metric
const recordPerformance = async (req, res) => {
  try {
    const { toolName, responseTime, success, endpoint } = req.body;
    const userId = req.user?.id; // Optional - may be anonymous

    // Validate required fields
    if (!toolName || responseTime === undefined || !endpoint) {
      return res.status(400).json({ 
        error: "Missing required fields. Required: toolName, responseTime, endpoint" 
      });
    }

    // Create the performance record
    const metric = await PerformanceMetric.create({
      userId,
      toolName,
      responseTime,
      success,
      endpoint
    });

    return res.status(201).json({ 
      message: "Performance metric recorded successfully",
      metric
    });
  } catch (error) {
    console.error("Error recording performance metric:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get daily average response times for the last N days
const getDailyAverages = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const limitDays = Math.min(parseInt(days), 30); // Limit to 30 days max
    
    // Calculate date cutoff
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - limitDays);
    
    // Get the daily averages grouped by day
    const dailyAverages = await PerformanceMetric.findAll({
      attributes: [
        [Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('avg', Sequelize.col('responseTime')), 'averageResponseTime'],
        [Sequelize.fn('count', Sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: cutoffDate
        },
        success: true // Only include successful requests
      },
      group: [Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt')), 'ASC']]
    });
    
    // Format the response
    const formattedData = dailyAverages.map(item => {
      const itemData = item.get({ plain: true });
      const date = new Date(itemData.date);
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: parseFloat(parseFloat(itemData.averageResponseTime).toFixed(2)),
        count: parseInt(itemData.count)
      };
    });
    
    // Calculate current and previous period averages
    const midpoint = Math.ceil(formattedData.length / 2);
    const currentPeriod = formattedData.slice(midpoint);
    const previousPeriod = formattedData.slice(0, midpoint);
    
    const currentAvg = currentPeriod.length > 0 
      ? currentPeriod.reduce((sum, day) => sum + day.value, 0) / currentPeriod.length 
      : 0;
      
    const previousAvg = previousPeriod.length > 0 
      ? previousPeriod.reduce((sum, day) => sum + day.value, 0) / previousPeriod.length 
      : 0;
    
    // Calculate percentage change
    const change = previousAvg !== 0 
      ? ((currentAvg - previousAvg) / previousAvg) * 100 
      : 0;
    
    return res.status(200).json({
      current: parseFloat(currentAvg.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      data: formattedData
    });
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get breakdown of tools being tracked and their performance metrics
const getToolsBreakdown = async (req, res) => {
  try {
    // Get data from the last 30 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    // Get list of unique tools being tracked
    const uniqueTools = await PerformanceMetric.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('toolName')), 'toolName']
      ],
      where: {
        createdAt: {
          [Op.gte]: cutoffDate
        }
      },
      order: [['toolName', 'ASC']]
    });
    
    const tools = uniqueTools.map(tool => tool.get({ plain: true }).toolName);
    
    // Get average response time and request count for each tool
    const toolsMetrics = await PerformanceMetric.findAll({
      attributes: [
        'toolName',
        [Sequelize.fn('AVG', Sequelize.col('responseTime')), 'avgResponseTime'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: cutoffDate
        },
        success: true
      },
      group: ['toolName'],
      order: [[Sequelize.literal('count'), 'DESC']]
    });
    
    // Format the top tools data
    const topTools = toolsMetrics.map(tool => {
      const data = tool.get({ plain: true });
      return {
        name: data.toolName,
        avgResponseTime: parseFloat(parseFloat(data.avgResponseTime).toFixed(2)),
        count: parseInt(data.count)
      };
    }).slice(0, 5); // Get top 5 tools by count
    
    return res.status(200).json({
      tools,
      topTools
    });
  } catch (error) {
    console.error("Error fetching tools breakdown:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  recordPerformance,
  getDailyAverages,
  getToolsBreakdown
}; 