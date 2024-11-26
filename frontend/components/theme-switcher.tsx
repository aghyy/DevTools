"use client"

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { isDarkModeEnabled } from "@/lib/theme-utils";

const ThemeSwitcher: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    // Only check localStorage and update state once (on client side)
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem('darkMode');
      setIsDarkMode(savedMode ? JSON.parse(savedMode) : isDarkModeEnabled());
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    // Only update the DOM and localStorage when isDarkMode changes
    if (isDarkMode !== null) {
      if (isDarkMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }
  }, [isDarkMode]); // This only runs when isDarkMode changes

  const toggleTheme = () => {
    if (isDarkMode !== null) {
      setIsDarkMode((prev) => !prev);
    }
  };

  if (isDarkMode === null) {
    // Return nothing (or a loader) while determining the dark mode status
    return null;
  }

  return (
    <Button onClick={toggleTheme} className="z-50 fixed top-3 right-3 size-10" aria-label="Toggle theme" variant="outline">
      {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
    </Button>
  );
};

export default ThemeSwitcher;