"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackActivity } from "@/services/activity";
import { routeToActivityMap } from "@/utils/tools";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  useEffect(() => {
    // Only track main sections and specific tools (not the dashboard itself)
    if (pathname === "/dashboard") {
      return;
    }
    
    let activity;
    
    // Check for exact path match first
    if (routeToActivityMap[pathname]) {
      activity = routeToActivityMap[pathname];
    } else {
      // Check for parent paths (e.g., /tools, /bookmarks)
      const mainPath = '/' + pathname.split('/')[1];
      
      // Default activity metadata based on section
      const defaultActivityMap: Record<string, {name: string; type: 'tool' | 'bookmark' | 'knowledge' | 'library'; icon: string}> = {
        "/tools": { name: "Tools", type: "tool", icon: "Hammer" },
        "/bookmarks": { name: "Bookmarks", type: "bookmark", icon: "Bookmark" },
        "/libraries": { name: "Libraries", type: "library", icon: "Library" },
        "/knowledge-base": { name: "Knowledge Base", type: "knowledge", icon: "GraduationCap" },
      };
      
      activity = defaultActivityMap[mainPath];
      
      // If it's a specific tool page but not in our map, create a generic entry
      if (mainPath === "/tools" && pathname.split('/').length > 2) {
        const toolName = pathname.split('/')[2];
        activity = {
          name: toolName.charAt(0).toUpperCase() + toolName.slice(1).replace(/-/g, ' '),
          type: "tool" as const,
          icon: "Hammer"
        };
      }
    }
    
    // Only track if we have valid activity metadata
    if (activity) {
      // Using sessionStorage instead of localStorage to better track session-based activities
      // This will refresh when the browser is closed, ensuring better tracking
      const trackingKey = `lastTracked:${pathname}`;
      const lastTracked = sessionStorage.getItem(trackingKey);
      const now = Date.now();
      
      // Only track if more than 30 seconds have passed since last visit to this specific page in this session
      if (!lastTracked || (now - parseInt(lastTracked)) > 30 * 1000) {
        // Track the activity with setTimeout to ensure it doesn't block page rendering
        setTimeout(() => {
          trackActivity({
            name: activity.name,
            type: activity.type,
            path: pathname,
            icon: activity.icon
          }).catch(error => {
            console.error('Failed to track activity:', error);
          });
          
          // Update the last tracked time
          sessionStorage.setItem(trackingKey, now.toString());
        }, 500);
      }
    }
  }, [pathname]);
  
  return children;
} 