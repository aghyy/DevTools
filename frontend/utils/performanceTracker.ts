import api from './axios';
import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Extend the InternalAxiosRequestConfig type to include our metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

// Helper function to determine if a URL is a tool endpoint
const isToolEndpoint = (url: string): boolean => {
  // Skip specific endpoints that shouldn't be tracked
  if (url.includes('/api/tools/add-to-wordlist') || url.includes('/redirect/')) {
    return false;
  }
  
  // Only track /api/tools/ endpoints
  return url.includes('/api/tools/');
  
  // Exclude other API endpoints:
  // - /api/activities
  // - /api/favorite-tools
  // - /api/performance
  // - /api/auth
  // - /api/bookmarks
  // - /api/code-snippets
};

// Helper function to extract tool name from URL
const extractToolName = (url: string): string => {
  // Remove query parameters first
  const urlWithoutQuery = url.split('?')[0];
  const urlParts = urlWithoutQuery.split('/');
  
  // For standard tool endpoints like /api/tools/[toolName]
  if (url.includes('/api/tools/')) {
    // Find the index after 'tools' in the URL
    const toolsIndex = urlParts.findIndex(part => part === 'tools');
    if (toolsIndex >= 0 && toolsIndex + 1 < urlParts.length) {
      const toolName = urlParts[toolsIndex + 1];
      return toolName;
    }
  }
  
  return 'unknown-tool';
};

// Function to track client-side tool performance
export const trackClientToolPerformance = async (toolName: string, operation: string, startTime: number) => {
  const endTime = new Date().getTime();
  const responseTime = endTime - startTime;
  
  try {
    await recordPerformanceMetric({
      toolName,
      responseTime,
      success: true,
      endpoint: `/tools/${toolName}/${operation}`,
      method: 'CLIENT',
      source: 'frontend'
    });
  } catch (err) {
    console.error('Failed to record client-side performance metric:', err);
  }
};

// React hook to track client-side tool performance
export const useClientToolPerformance = (toolName: string) => {
  // Function to start tracking a client-side operation
  const trackOperation = (operation: string) => {
    const startTime = new Date().getTime();
    return {
      // Call this when the operation completes
      complete: () => {
        trackClientToolPerformance(toolName, operation, startTime);
      }
    };
  };
  
  return { trackOperation };
};

// Setup axios interceptor for tracking response times
export const setupPerformanceTracking = () => {
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Add metadata with start time to the request
    config.metadata = { startTime: new Date().getTime() };
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  api.interceptors.response.use((response: AxiosResponse) => {
    const endTime = new Date().getTime();
    const startTime = response.config.metadata?.startTime;
    
    if (startTime) {
      const responseTime = endTime - startTime;
      
      // Determine if this is a tool request
      const url = response.config.url || '';
      
      if (isToolEndpoint(url)) {
        // Extract tool name from URL or path
        const toolName = extractToolName(url);
        
        // Record the performance metric
        recordPerformanceMetric({
          toolName,
          responseTime,
          success: response.status >= 200 && response.status < 300,
          endpoint: url,
          method: response.config.method?.toUpperCase() || 'GET',
          source: 'frontend'
        }).catch(err => {
          console.error('Failed to record performance metric:', err);
        });
      }
    }
    
    return response;
  }, (error) => {
    if (error.config?.metadata?.startTime) {
      const endTime = new Date().getTime();
      const startTime = error.config.metadata.startTime;
      const responseTime = endTime - startTime;
      
      // Extract URL information
      const url = error.config.url || '';
      
      if (isToolEndpoint(url)) {
        // Extract tool name from URL or path
        const toolName = extractToolName(url);
        
        // Record the failed performance metric
        recordPerformanceMetric({
          toolName,
          responseTime,
          success: false,
          endpoint: url,
          method: error.config.method?.toUpperCase() || 'GET',
          source: 'frontend'
        }).catch(err => {
          console.error('Failed to record performance metric:', err);
        });
      }
    }
    
    return Promise.reject(error);
  });
};

// Function to record a performance metric
interface PerformanceMetricData {
  toolName: string;
  responseTime: number;
  success: boolean;
  endpoint: string;
  method: string;
  source: 'frontend' | 'backend';
}

export const recordPerformanceMetric = async (data: PerformanceMetricData) => {
  try {
    await api.post('/api/performance', data);
  } catch (error) {
    console.error('Error recording performance metric:', error);
  }
}; 