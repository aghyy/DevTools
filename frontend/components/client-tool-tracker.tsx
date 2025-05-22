"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackActivity } from '@/services/activity';
import { trackClientToolPerformance } from '@/utils/performanceTracker';
import { toast } from 'sonner';

// This component wraps client-side tools to track both activity and performance
interface ClientToolTrackerProps {
  name: string;
  icon: string;
  children: React.ReactNode;
  trackInitialLoad?: boolean;
}

export const ClientToolTracker: React.FC<ClientToolTrackerProps> = ({
  name,
  icon,
  children,
  trackInitialLoad = true
}) => {
  const pathname = usePathname();
  const toolName = name.toLowerCase().replace(/\s+/g, '-');
  
  // Track page activity and initial load time
  useEffect(() => {
    const startTime = new Date().getTime();
    
    // Only track when component mounts (page is visited)
    const logActivity = async () => {
      try {
        // Track page visit
        await trackActivity({
          name,
          type: 'tool',
          path: pathname,
          icon
        });
        
        // Also track initial load time if enabled
        if (trackInitialLoad) {
          trackClientToolPerformance(toolName, 'initial-load', startTime);
        }
      } catch {
        // Just log the error but don't stop the page from rendering
        toast.error('Failed to track activity.');
      }
    };

    logActivity();
  }, [name, pathname, icon, toolName, trackInitialLoad]);

  // Just render children - this is a transparent wrapper
  return <>{children}</>;
}; 