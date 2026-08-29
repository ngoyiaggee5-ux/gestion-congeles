export const defaultSettings = {
  font: "dm-sans",
  theme: "light",
  currency: "CDF",
  usdRate: 2800,
};

export const FONT_OPTIONS = ["dm-sans", "outfit", "system", "serif"];

export const FONT_STACKS = {
  "dm-sans": {
    body: '"DM Sans", system-ui, sans-serif',
    display: '"Outfit", system-ui, sans-serif',
  },
  outfit: {
    body: '"Outfit", system-ui, sans-serif',
    display: '"Outfit", system-ui, sans-serif',
  },
  system: {
    body: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    display: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  serif: {
    body: 'Georgia, "Times New Roman", serif',
    display: 'Georgia, "Times New Roman", serif',
  },
};

export function getFontStacks(font = defaultSettings.font) {
  return FONT_STACKS[font] || FONT_STACKS["dm-sans"];
}

export function normalizeSettings(settings = defaultSettings) {
  const merged = { ...defaultSettings, ...settings };
  const font = FONT_OPTIONS.includes(merged.font)
    ? merged.font
    : defaultSettings.font;
  return {
    ...merged,
    font,
    theme: merged.theme === "dark" ? "dark" : "light",
    currency: String(merged.currency || "CDF").toUpperCase(),
    usdRate: Number(merged.usdRate) || 2800,
  };
}

export function formatMoney(value, settings = defaultSettings) {
  const { currency, usdRate } = normalizeSettings(settings);
  const num = Number(value) || 0;

  if (currency === "USD") {
    return formatUsd(num / usdRate);
  }

  return formatCdf(num);
}

export function formatCdf(value) {
  const num = Number(value) || 0;
  try {
    return new Intl.NumberFormat("fr-CD", {
      style: "currency",
      currency: "CDF",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${num.toLocaleString("fr-FR")} FC`;
  }
}

export function formatUsd(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function cdfToUsd(cdf, settings = defaultSettings) {
  const { usdRate } = normalizeSettings(settings);
  return (Number(cdf) || 0) / usdRate;
}

export function usdToCdf(usd, settings = defaultSettings) {
  const { usdRate } = normalizeSettings(settings);
  return (Number(usd) || 0) * usdRate;
}

export function formatCdfAsUsd(cdfAmount, settings = defaultSettings) {
  return formatUsd(cdfToUsd(cdfAmount, settings));
}

export function formatMoneyEquivalent(value, settings = defaultSettings) {
  const { currency } = normalizeSettings(settings);
  const num = Number(value) || 0;
  return currency === "USD" ? formatCdf(num) : formatCdfAsUsd(num, settings);
}

export function applyAppearance(settings = defaultSettings) {
  const normalized = normalizeSettings(settings);
  const { theme, font } = normalized;
  const stacks = getFontStacks(font);
  const root = document.documentElement;

  root.setAttribute("data-theme", theme);
  root.setAttribute("data-font", font);
  root.style.setProperty("--font-body", stacks.body);
  root.style.setProperty("--font-display", stacks.display);
  root.style.setProperty("--bs-body-font-family", stacks.body);
  root.style.setProperty("--bs-font-sans-serif", stacks.body);

  if (document.body) {
    document.body.style.fontFamily = stacks.body;
  }
}
