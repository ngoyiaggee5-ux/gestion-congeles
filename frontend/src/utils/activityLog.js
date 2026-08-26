const MAX_LOGS = 100;

export function appendActivityLog(data, entry) {
  if (!data.activityLogs) data.activityLogs = [];
  data.activityLogs.unshift({
    id: Date.now(),
    created_at: new Date().toISOString(),
    ...entry,
  });
  if (data.activityLogs.length > MAX_LOGS) {
    data.activityLogs.length = MAX_LOGS;
  }
}

export function createVerificationCode() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return String(Date.now()).slice(-16);
}

export function logLocalActivity(data, { userName, action, entityType, entityId, summary, meta }) {
  appendActivityLog(data, {
    user_name: userName || "Système",
    action,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    meta: meta || null,
  });
}
