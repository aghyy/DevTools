import { useTheme } from "next-themes";

export const useThemeColors = () => {
  const { theme, systemTheme } = useTheme();

  // Theme-aware colors - properly handling system theme
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDark = resolvedTheme === "dark";

  const themeColors = {
    primary: isDark ? "#1E293B" : "#F8FAFC",
    card: isDark ? "rgba(17, 24, 39, 0.7)" : "rgba(255, 255, 255, 0.8)",
    border: isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(203, 213, 225, 0.6)",
    muted: isDark ? "#4B5563" : "#94A3B8",
    text: isDark ? "#E5E7EB" : "#1E293B",
    textMuted: isDark ? "#9CA3AF" : "#64748B",
    chartColors: {
      activity: {
        current: isDark ? "#10B981" : "#059669",
        previous: isDark ? "rgba(16, 185, 129, 0.4)" : "rgba(5, 150, 105, 0.4)",
        grid: isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(203, 213, 225, 0.6)",
      },
      response: {
        line: isDark ? "#6366F1" : "#4F46E5",
        grid: isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(203, 213, 225, 0.6)",
      },
      sessions: {
        current: isDark ? "#F97316" : "#EA580C",
        previous: isDark ? "rgba(249, 115, 22, 0.4)" : "rgba(234, 88, 12, 0.4)",
        grid: isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(203, 213, 225, 0.6)",
      },
      resource: {
        bar: isDark ? "#EC4899" : "#DB2777", // Pink
        grid: isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(203, 213, 225, 0.6)",
      },
    },
    barColors: [
      isDark ? "#3B82F6" : "#2563EB", // Blue
      isDark ? "#10B981" : "#059669", // Green
      isDark ? "#F97316" : "#EA580C", // Orange
      isDark ? "#8B5CF6" : "#7C3AED", // Purple
      isDark ? "#EC4899" : "#DB2777", // Pink
      isDark ? "#F43F5E" : "#E11D48", // Red
      isDark ? "#6366F1" : "#4F46E5", // Indigo
      isDark ? "#14B8A6" : "#0D9488", // Teal
    ],
    positiveChange: isDark ? "#10B981" : "#059669",
    negativeChange: isDark ? "#F43F5E" : "#E11D48",
  };

  return themeColors;
};

export const useChartDescriptions = () => {
  return {
    weeklyActivity:
      "Shows your activity counts for each day of the past week. The current week is represented by the green line, and the previous week is represented by the brighter line.",
    responseTime:
      "Shows the average response time of tools over time. Lower values indicate better performance.",
    resourceUsage:
      "A breakdown of your most used resources. Displays the top 10 most frequently accessed resources.",
  };
};
