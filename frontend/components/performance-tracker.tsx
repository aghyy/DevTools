"use client";

import { useEffect } from "react";
import { setupPerformanceTracking } from "@/utils/performanceTracker";

export const PerformanceTracker: React.FC = () => {
  useEffect(() => {
    setupPerformanceTracking();
  }, []);
  
  return null;
}; 