export function getChartTheme(isDark) {
  if (isDark) {
    return {
      grid: "#2a4a3f",
      tick: "#b0c4bb",
      primary: "#34d399",
      primarySoft: "rgba(52, 211, 153, 0.35)",
      ice: "#67e8f9",
    };
  }
  return {
    grid: "#d7e5de",
    tick: "#5b6b63",
    primary: "#0b6e4f",
    primarySoft: "rgba(11, 110, 79, 0.35)",
    ice: "#1a9bb8",
  };
}
