"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useTheme } from "next-themes";
import { isDarkModeEnabled } from "@/utils/theme";

import { cn } from "@/lib/utils";

export interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientSize?: number;
  gradientColor?: string;
  gradientColorDark?: string;
  gradientOpacity?: number;
  onClick?: () => void;
}

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#ededed",
  gradientColorDark = "#262626",
  gradientOpacity = 0.7,
  onClick,
}: MagicCardProps) {
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(isDarkModeEnabled(theme));

  useEffect(() => {
    setIsDarkMode(isDarkModeEnabled(theme));

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => setIsDarkMode(mediaQuery.matches);

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { left, top } = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - left);
      mouseY.set(e.clientY - top);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  useEffect(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cn(
        "group relative flex size-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 border text-black dark:text-white",
        className,
      )}
    >
      <div className="relative z-10 w-full h-full">{children}</div>
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${isDarkMode ? gradientColorDark : gradientColor}, transparent 100%)
          `,
          opacity: gradientOpacity,
        }}
        suppressHydrationWarning
      />
    </div>
  );
}
