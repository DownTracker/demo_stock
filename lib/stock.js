export function statusOf(item) {
  const warn = item.threshold * 1.5;
  if (item.qty < item.threshold) return "red";
  if (item.qty < warn) return "yellow";
  return "green";
}

export const statusColor = {
  red: "#C1443A",
  yellow: "#D79A2C",
  green: "#3C7A45",
};

export const statusLabel = {
  red: "Low stock",
  yellow: "Watch",
  green: "Healthy",
};

export function fmtDateTime(ts) {
  return new Date(ts).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
