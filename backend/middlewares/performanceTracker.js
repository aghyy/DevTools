const db = require("../models");
const PerformanceMetric = db.performanceMetrics;

// Helper function to determine if a URL is a tool endpoint
const isToolEndpoint = (url) => {
  // Skip specific endpoints that shouldn't be tracked
  if (url.includes('/api/tools/add-to-wordlist') || url.includes('/redirect/')) {
    return false;
  }
  
  // Only track /api/tools/ endpoints
  return url.startsWith('/api/tools/');
  
  // Exclude other API endpoints
  // - /api/activities
  // - /api/favorite-tools
  // - /api/performance
  // - /api/auth
  // - /api/bookmarks
  // - /api/code-snippets
};

// Helper function to extract tool name from URL
const extractToolName = (url) => {
  // Remove query parameters first
  const urlWithoutQuery = url.split('?')[0];
  const urlParts = urlWithoutQuery.split('/');
  
  // For standard tool endpoints like /api/tools/[toolName]
  if (urlWithoutQuery.startsWith('/api/tools/')) {
    let toolName = urlParts[3] || 'unknown-tool';
    
    // Consolidate hash-related tools
    if (toolName.startsWith('decrypt-')) {
      return 'hash';
    }
    
    // Consolidate vigenere tools (though only one exists in the codebase)
    if (toolName === 'vigenere-cipher') {
      return 'vigenere';
    }
    
    return toolName;
  }
  
  return 'api-endpoint';
};

// Middleware to track response times for tools
const trackToolPerformance = (req, res, next) => {
  // Only track tool requests
  if (!isToolEndpoint(req.originalUrl)) {
    return next();
  }
  
  // Store the start time
  const startTime = Date.now();
  
  // Function to record the metric when the response is sent
  const recordMetric = () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Extract the tool name from the URL
    const toolName = extractToolName(req.originalUrl);
    
    // Create the performance record (don't wait for it)
    PerformanceMetric.create({
      userId: req.user?.id || null,
      toolName,
      responseTime,
      success: res.statusCode >= 200 && res.statusCode < 300,
      endpoint: req.originalUrl,
      method: req.method,
      source: 'backend'
    }).catch(error => {
      console.error('Error recording performance metric:', error);
    });
  };

  // Listen for the response to finish
  res.on('finish', recordMetric);
  
  next();
};

module.exports = {
  trackToolPerformance
}; 