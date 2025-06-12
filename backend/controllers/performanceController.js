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

// Get optimized response time chart data
const getResponseTimeChartData = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Calculate date ranges
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    // Get performance metrics for the last 7 days
    const whereClause = {
      createdAt: {
        [Op.gte]: sevenDaysAgo
      },
      success: true // Only include successful requests
    };
    
    // Add user filter if available
    if (userId) {
      whereClause.userId = userId;
    }
    
    const metrics = await PerformanceMetric.findAll({
      where: whereClause,
      attributes: ['createdAt', 'responseTime'],
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

    // Generate all 7 days
    const allDays = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      allDays.push({
        dateStr: getDateString(date),
        name: getDayAbbreviation(date),
        date: date
      });
    }

    // Group metrics by date and calculate averages
    const dailyMetrics = new Map();
    
    metrics.forEach(metric => {
      const metricDate = new Date(metric.createdAt);
      const dateStr = getDateString(metricDate);
      
      if (!dailyMetrics.has(dateStr)) {
        dailyMetrics.set(dateStr, []);
      }
      dailyMetrics.get(dateStr).push(metric.responseTime);
    });

    // Build chart data with all 7 days
    const chartData = allDays.map(day => {
      const dayMetrics = dailyMetrics.get(day.dateStr) || [];
      const avgResponseTime = dayMetrics.length > 0 
        ? dayMetrics.reduce((sum, time) => sum + time, 0) / dayMetrics.length 
        : 0;
      
      return {
        name: day.name,
        value: Math.round(avgResponseTime * 100) / 100, // Round to 2 decimal places
        count: dayMetrics.length
      };
    });

    // Calculate current week average
    const totalResponseTime = chartData.reduce((sum, day) => {
      return day.count > 0 ? sum + (day.value * day.count) : sum;
    }, 0);
    const totalRequests = chartData.reduce((sum, day) => sum + day.count, 0);
    const currentAvg = totalRequests > 0 ? totalResponseTime / totalRequests : 0;

    // Get previous week data for comparison
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);
    
    const previousWeekClause = {
      createdAt: {
        [Op.gte]: fourteenDaysAgo,
        [Op.lt]: sevenDaysAgo
      },
      success: true
    };
    
    if (userId) {
      previousWeekClause.userId = userId;
    }
    
    const previousMetrics = await PerformanceMetric.findAll({
      where: previousWeekClause,
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('responseTime')), 'avgResponseTime'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ]
    });

    const previousData = previousMetrics[0]?.get({ plain: true });
    const previousAvg = previousData?.avgResponseTime ? parseFloat(previousData.avgResponseTime) : 0;
    
    // Calculate percentage change
    let change = 0;
    if (previousAvg > 0 && currentAvg > 0) {
      change = ((currentAvg - previousAvg) / previousAvg) * 100;
    } else if (currentAvg > 0 && previousAvg === 0) {
      change = 100; // 100% increase from zero
    }

    // Get tool information
    const toolsData = await PerformanceMetric.findAll({
      where: whereClause,
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('toolName')), 'toolName']
      ],
      order: [['toolName', 'ASC']]
    });

    const tools = toolsData.map(tool => tool.get({ plain: true }).toolName);

    // Get top tools breakdown
    const topToolsData = await PerformanceMetric.findAll({
      where: whereClause,
      attributes: [
        'toolName',
        [Sequelize.fn('AVG', Sequelize.col('responseTime')), 'avgResponseTime'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['toolName'],
      order: [[Sequelize.literal('count'), 'DESC']],
      limit: 5
    });

    const topTools = topToolsData.map(tool => {
      const data = tool.get({ plain: true });
      return {
        name: data.toolName,
        avgResponseTime: Math.round(parseFloat(data.avgResponseTime) * 100) / 100,
        count: parseInt(data.count)
      };
    });

    return res.status(200).json({
      current: Math.round(currentAvg * 100) / 100,
      change: Math.round(change * 100) / 100,
      data: chartData,
      tools,
      topTools,
      weeklyAvg: Math.round(currentAvg * 100) / 100
    });
  } catch (error) {
    console.error("Error fetching response time chart data:", error);
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
  getResponseTimeChartData,
  getDailyAverages,
  getToolsBreakdown
}; 