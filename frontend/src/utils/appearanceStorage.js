const APPEARANCE_KEY = "mbala-kwa-appearance-v1";

export function loadAppearancePrefs() {
  try {
    const raw = localStorage.getItem(APPEARANCE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAppearancePrefs(partial) {
  const current = loadAppearancePrefs();
  const next = { ...current, ...partial };
  localStorage.setItem(APPEARANCE_KEY, JSON.stringify(next));
  return next;
}

export function mergeAppearance(settings = {}) {
  const prefs = loadAppearancePrefs();
  const merged = { ...settings, ...prefs };
  if (merged.usdRate !== undefined) {
    merged.usdRate = Number(merged.usdRate) || 2800;
  }
  if (merged.currency) {
    merged.currency = String(merged.currency).toUpperCase();
  }
  return merged;
}
