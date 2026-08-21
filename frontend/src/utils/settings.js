export const defaultSettings = {
  font: "dm-sans",
  theme: "light",
  currency: "CDF",
  usdRate: 2800,
};

export function formatMoney(value, settings = defaultSettings) {
  const num = Number(value) || 0;
  const currency = settings?.currency || "CDF";
  const usdRate = Number(settings?.usdRate) || 2800;

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
  const rate = Number(settings?.usdRate) || 2800;
  return (Number(cdf) || 0) / rate;
}

export function usdToCdf(usd, settings = defaultSettings) {
  const rate = Number(settings?.usdRate) || 2800;
  return (Number(usd) || 0) * rate;
}

export function applyAppearance(settings = defaultSettings) {
  const theme = settings?.theme || "light";
  const font = settings?.font || "dm-sans";
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-font", font);
}
