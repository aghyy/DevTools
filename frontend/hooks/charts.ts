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
        bar: isDark ? "#10B981" : "#059669",
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
    },
    pieColors: [
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

export const useTooltipStyle = () => {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDark = resolvedTheme === "dark";

  const tooltipStyle = {
    backgroundColor: isDark
      ? "rgba(17, 24, 39, 0.95)"
      : "rgba(255, 255, 255, 0.95)",
    borderColor: isDark ? "#374151" : "#E2E8F0",
    borderRadius: "6px",
    color: isDark ? "#FFFFFF" : "#1E293B",
    fontSize: "12px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    padding: "6px 10px",
  };

  return tooltipStyle;
};
