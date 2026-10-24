export function localDay(now = Date.now()) {
  const date = new Date(now);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Phase IDs make completion idempotent across refreshes, navigation and tabs.
export function readFocusLog(value, now = Date.now()) {
  const records = new Map();
  if (Array.isArray(value)) for (const record of value) {
    if (!record || typeof record.id !== 'string' || !record.id || record.id.length > 200
      || !Number.isFinite(record.completedAt) || record.completedAt < 0 || record.completedAt > now
      || !Number.isFinite(record.duration) || record.duration < 60000 || record.duration > 10800000) continue;
    records.set(record.id, { id: record.id, completedAt: record.completedAt, duration: record.duration });
  }
  return [...records.values()].sort((a, b) => a.completedAt - b.completedAt).slice(-4096);
}

export function mergeFocusLog(...logs) { return readFocusLog(logs.flat()); }

export function dailyFocus(log, now = Date.now()) {
  const day = localDay(now);
  return log.reduce((total, record) => {
    if (localDay(record.completedAt) === day) { total.sessions++; total.milliseconds += record.duration; }
    return total;
  }, { sessions: 0, milliseconds: 0 });
}
