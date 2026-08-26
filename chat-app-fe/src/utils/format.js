export function formatTime(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDay(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// The backend's User schema only has `name` (not `username`, despite
// several routes/controllers .select()-ing or populate()-ing "username").
// Mongoose silently drops unknown select/populate fields, so `username`
// will never actually be present on API responses. Fall back gracefully.
export function displayName(user) {
  if (!user) return "Unknown";
  return  user.name || (user.email ? user.email.split("@")[0] : "Unknown");
}

export function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
