/** Date locale YYYY-MM-DD (fuseau navigateur, pas UTC). */
export function localDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Jour local d'une vente / timestamp ISO. */
export function isoToLocalDateKey(iso) {
  if (!iso) return "";
  return localDateKey(new Date(iso));
}

export function isSameLocalDay(iso, dateKey) {
  return isoToLocalDateKey(iso) === dateKey;
}
