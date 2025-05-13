"use client"

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import ThemeIcon from './theme-icon';
import { useTheme } from 'next-themes';

const ThemeSwitcher = ({ fixed = false }: { fixed?: boolean }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    }
    else if (theme === 'light') {
      setTheme('system');
    }
    else {
      setTheme('dark');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Button onClick={toggleTheme} className={`z-50 top-3 right-3 size-10 ${fixed ? 'fixed' : 'absolute'}`} aria-label="Toggle theme" variant="outline">
        <ThemeIcon />
      </Button>
    </>
  );
};

export default ThemeSwitcher;