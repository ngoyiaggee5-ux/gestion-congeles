/** Vente au montant : conversion montant CDF ↔ quantité (kg décimal ou pièces entières). */

export function isWeightUnit(unit = "") {
  const u = String(unit).toLowerCase().trim();
  return u === "kg" || u === "g" || u.startsWith("kg") || u.includes("/kg");
}

export function quantityFromAmount(amount, unitPrice, unit = "kg") {
  const amt = Math.max(0, Number(amount) || 0);
  const price = Number(unitPrice) || 0;
  if (!price || amt <= 0) return 0;

  const raw = amt / price;
  if (isWeightUnit(unit)) {
    return Math.round(raw * 1000) / 1000;
  }
  const whole = Math.floor(raw);
  return whole >= 1 ? whole : 0;
}

export function cartLineTotal(item) {
  return resolveLineTotal(item);
}

/** Montant réel d'une ligne (panier ou facture). */
export function resolveLineTotal(item) {
  if (item?.line_total != null && Number(item.line_total) > 0) {
    return Math.round(Number(item.line_total));
  }
  if (item?.sale_amount != null && Number(item.sale_amount) > 0) {
    return Math.round(Number(item.sale_amount));
  }
  return Math.round(Number(item.quantity) * Number(item.unit_price));
}

export function formatCartQuantity(quantity, unit = "kg") {
  const q = Number(quantity) || 0;
  if (isWeightUnit(unit)) {
    const formatted = q.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
    return `${formatted} ${unit}`;
  }
  return `${Math.round(q)} ${unit}`;
}

export function amountFromQuantity(quantity, unitPrice) {
  return Math.round(Number(quantity) * Number(unitPrice));
}

/** Valeur pour input number (point décimal, pas de locale). */
export function formatQtyInputValue(quantity, unit = "kg", mode = "détail") {
  const q = Number(quantity) || 0;
  if (mode === "gros" || !isWeightUnit(unit)) {
    return String(Math.round(q));
  }
  const rounded = Math.round(q * 1000) / 1000;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

/** État d'affichage cohérent d'une ligne panier (montant ↔ quantité). */
export function getCartLineDisplay(item, product) {
  const unit = product?.unit ?? "kg";
  const price = Number(item.unit_price) || 0;
  const soldByAmount =
    item.mode === "détail" &&
    item.sale_amount != null &&
    Number(item.sale_amount) > 0;

  let quantity = Number(item.quantity) || 0;
  let amount = soldByAmount
    ? Math.round(Number(item.sale_amount))
    : amountFromQuantity(quantity, price);

  if (soldByAmount && price > 0) {
    quantity = quantityFromAmount(amount, price, unit);
  }

  return {
    quantity,
    amount,
    lineTotal: soldByAmount ? amount : Math.round(quantity * price),
    soldByAmount,
    quantityInput: formatQtyInputValue(quantity, unit, item.mode),
    amountInput: String(amount),
    quantityLabel: formatCartQuantity(quantity, unit),
  };
}
