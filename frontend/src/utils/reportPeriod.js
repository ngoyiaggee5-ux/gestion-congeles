export const PERIOD_TYPES = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
  yearly: "yearly",
  custom: "custom",
};

export const PERIOD_OPTIONS = [
  { id: PERIOD_TYPES.daily, label: "Journalier", icon: "bi-calendar-day" },
  { id: PERIOD_TYPES.weekly, label: "Hebdomadaire", icon: "bi-calendar-week" },
  { id: PERIOD_TYPES.monthly, label: "Mensuel", icon: "bi-calendar-month" },
  { id: PERIOD_TYPES.yearly, label: "Annuel", icon: "bi-calendar-range" },
  { id: PERIOD_TYPES.custom, label: "Personnalisé", icon: "bi-sliders" },
];

function parseDateInput(value) {
  if (!value) return new Date();
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeekMonday(date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfWeekSunday(date) {
  const start = startOfWeekMonday(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return endOfDay(end);
}

function startOfMonth(date) {
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
}

function endOfMonth(date) {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function startOfYear(date) {
  return startOfDay(new Date(date.getFullYear(), 0, 1));
}

function endOfYear(date) {
  return endOfDay(new Date(date.getFullYear(), 11, 31));
}

function formatShort(date) {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function getPeriodRange(period, referenceDate, customEndDate) {
  const ref = parseDateInput(referenceDate);

  switch (period) {
    case PERIOD_TYPES.weekly:
      return { start: startOfWeekMonday(ref), end: endOfWeekSunday(ref) };
    case PERIOD_TYPES.monthly:
      return { start: startOfMonth(ref), end: endOfMonth(ref) };
    case PERIOD_TYPES.yearly:
      return { start: startOfYear(ref), end: endOfYear(ref) };
    case PERIOD_TYPES.custom: {
      const endRef = parseDateInput(customEndDate || referenceDate);
      const start = startOfDay(ref);
      const end = endOfDay(endRef);
      if (start > end) {
        return { start: startOfDay(endRef), end: endOfDay(ref) };
      }
      return { start, end };
    }
    case PERIOD_TYPES.daily:
    default:
      return { start: startOfDay(ref), end: endOfDay(ref) };
  }
}

export function formatPeriodLabel(period, referenceDate, customEndDate) {
  const { start, end } = getPeriodRange(period, referenceDate, customEndDate);

  switch (period) {
    case PERIOD_TYPES.daily:
      return `Journalier — ${formatShort(start)}`;
    case PERIOD_TYPES.weekly:
      return `Hebdomadaire — du ${formatShort(start)} au ${formatShort(end)}`;
    case PERIOD_TYPES.monthly:
      return `Mensuel — ${start.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
    case PERIOD_TYPES.yearly:
      return `Annuel — ${start.getFullYear()}`;
    case PERIOD_TYPES.custom:
      return `Personnalisé — du ${formatShort(start)} au ${formatShort(end)}`;
    default:
      return formatShort(start);
  }
}

export function isInPeriod(isoDate, range) {
  const d = new Date(isoDate);
  return d >= range.start && d <= range.end;
}

export function filterByPeriod(items, dateField, range) {
  return items.filter((item) => isInPeriod(item[dateField], range));
}
