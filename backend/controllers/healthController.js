const os = require('os');
const db = require("../models");
const { Sequelize } = require("sequelize");

// Get system health information
const getSystemHealth = async (req, res) => {
  try {
    // Get database connection status
    let dbStatus = 'healthy';
    let dbUptime = null;
    try {
      await db.sequelize.authenticate();
      // Get database uptime from a simple query
      const result = await db.sequelize.query('SELECT NOW() - pg_postmaster_start_time() as uptime');
      dbUptime = result[0][0].uptime;
    } catch (error) {
      dbStatus = 'unhealthy';
      console.error('Database health check failed:', error);
    }

    // Get system information
    const systemInfo = {
      uptime: os.uptime(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg(),
      platform: os.platform(),
      hostname: os.hostname()
    };

    // Calculate memory usage percentage
    const memoryUsage = {
      total: systemInfo.totalMemory,
      free: systemInfo.freeMemory,
      used: systemInfo.totalMemory - systemInfo.freeMemory,
      percentage: ((systemInfo.totalMemory - systemInfo.freeMemory) / systemInfo.totalMemory * 100).toFixed(2)
    };

    // Format uptime for display
    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      
      return parts.join(' ') || '0m';
    };

    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          uptime: dbUptime ? formatUptime(dbUptime) : null
        },
        system: {
          status: 'healthy',
          uptime: formatUptime(systemInfo.uptime),
          memory: memoryUsage,
          cpu: {
            cores: systemInfo.cpuCount,
            loadAverage: systemInfo.loadAverage.map(load => load.toFixed(2))
          }
        }
      }
    });
  } catch (error) {
    console.error("Error getting system health:", error);
    return res.status(500).json({ 
      status: 'unhealthy',
      error: "Failed to get system health information" 
    });
  }
};

module.exports = {
  getSystemHealth
}; 