function cssVar(name, fallback) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

export function getChartTheme(isDark) {
  const primary = cssVar("--vf-green", isDark ? "#34d399" : "#0b6e4f");
  const ice = cssVar("--vf-ice", isDark ? "#67e8f9" : "#1a9bb8");
  const muted = cssVar("--vf-muted", isDark ? "#b0c4bb" : "#5b6b63");
  const line = cssVar("--vf-line", isDark ? "#2a4a3f" : "#d7e5de");

  return {
    grid: line,
    tick: muted,
    primary,
    primarySoft: `color-mix(in srgb, ${primary} 35%, transparent)`,
    ice,
  };
}
