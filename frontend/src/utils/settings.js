export const defaultSettings = {
  font: "dm-sans",
  theme: "light",
  currency: "CDF",
  usdRate: 2800,
};

export function normalizeSettings(settings = defaultSettings) {
  const merged = { ...defaultSettings, ...settings };
  return {
    ...merged,
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
  const theme = settings?.theme || "light";
  const font = settings?.font || "dm-sans";
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-font", font);
}
