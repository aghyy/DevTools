"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackActivity } from '@/services/activity';

// Activity tracking component that should be used in tool and bookmark pages
interface ActivityTrackerProps {
  name: string;
  type: 'tool' | 'bookmark' | 'favorite' | 'codeSnippet';
  icon: string;
  children: React.ReactNode;
}

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  name,
  type,
  icon,
  children
}) => {
  const pathname = usePathname();

  useEffect(() => {
    // Only track when component mounts (page is visited)
    const logActivity = async () => {
      try {
        await trackActivity({
          name,
          type,
          path: pathname,
          icon
        });
      } catch (error) {
        // Just log the error but don't stop the page from rendering
        console.error('Failed to track activity:', error);
      }
    };

    logActivity();
  }, [name, type, pathname, icon]);

  // Just render children - this is a transparent wrapper
  return <>{children}</>;
}; 