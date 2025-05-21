"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackActivity } from "@/services/activity";
import { routeToActivityMap } from "@/utils/tools";
import { useAtom } from "jotai";
import { isGuestAtom, initializeGuestStateAtom } from "@/atoms/auth";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isGuest] = useAtom(isGuestAtom);
  const [, initializeGuestState] = useAtom(initializeGuestStateAtom);
  
  useEffect(() => {
    initializeGuestState();
  }, [initializeGuestState]);
  
  useEffect(() => {
    // Skip tracking for guest users
    if (isGuest) {
      return;
    }
    
    // Only track main sections and specific tools (not the dashboard itself)
    // Also skip tracking for main paths: /tools, /bookmarks, and /code-snippets
    if (pathname === "/dashboard" || 
        pathname === "/tools" || 
        pathname === "/bookmarks" || 
        pathname === "/code-snippets" ||
        pathname === "/favorites") {
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
      // Removed /tools and /bookmarks from here since we're excluding them
      const defaultActivityMap: Record<string, {name: string; type: 'tool' | 'bookmark'; icon: string}> = {
        // We've removed /tools and /bookmarks from here
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