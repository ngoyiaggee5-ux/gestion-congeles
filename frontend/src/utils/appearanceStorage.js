const APPEARANCE_KEY = "mbala-kwa-appearance-v1";

const APPEARANCE_FIELDS = ["theme", "font", "palette", "currency", "usdRate"];

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

function normalizeMerged(merged) {
  if (merged.usdRate !== undefined) {
    merged.usdRate = Number(merged.usdRate) || 2800;
  }
  if (merged.currency) {
    merged.currency = String(merged.currency).toUpperCase();
  }
  return merged;
}

function cacheFromSettings(settings) {
  const payload = {};
  for (const key of APPEARANCE_FIELDS) {
    if (settings[key] !== undefined) payload[key] = settings[key];
  }
  if (Object.keys(payload).length) saveAppearancePrefs(payload);
}

/**
 * Fusionne l'apparence.
 * - preferLocal: true → cache navigateur gagne (affichage immédiat hors-ligne)
 * - preferLocal: false (défaut) → source serveur / app gagne, cache aligné
 */
export function mergeAppearance(settings = {}, { preferLocal = false } = {}) {
  const prefs = loadAppearancePrefs();
  const merged = normalizeMerged(
    preferLocal ? { ...settings, ...prefs } : { ...prefs, ...settings }
  );

  if (!preferLocal) {
    cacheFromSettings(merged);
  }

  return merged;
}
