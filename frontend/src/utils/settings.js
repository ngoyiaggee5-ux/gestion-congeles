export const defaultSettings = {
  font: "dm-sans",
  theme: "light",
  tvaRate: 16,
  currency: "CDF",
  usdRate: 2800,
};

export function calcTotals(subtotalHt, tvaRate = defaultSettings.tvaRate) {
  const ht = Number(subtotalHt) || 0;
  const rate = Number(tvaRate) || 0;
  const tva = ht * (rate / 100);
  return {
    subtotalHt: ht,
    tva,
    totalTtc: ht + tva,
  };
}

export function formatMoney(value, settings = defaultSettings) {
  const num = Number(value) || 0;
  const currency = settings?.currency || "CDF";
  const usdRate = Number(settings?.usdRate) || 2800;

  if (currency === "USD") {
    const usd = num / usdRate;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usd);
  }

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

export function applyAppearance(settings = defaultSettings) {
  document.documentElement.setAttribute("data-theme", settings.theme || "light");
  document.documentElement.setAttribute("data-font", settings.font || "dm-sans");
}
