import { statusOf, statusColor, statusLabel } from "@/lib/stock";

export default function StockCard({ item }) {
  const s = statusOf(item);
  const pct = Math.min(100, Math.round((item.qty / (item.threshold * 2)) * 100));

  return (
    <div className="bg-surface border border-line rounded-2xl px-4 py-3">
      <div className="flex items-baseline justify-between">
        <div className="font-bold text-sm text-ink">{item.name}</div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: statusColor[s] }}
          />
          <span
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: statusColor[s] }}
          >
            {statusLabel[s]}
          </span>
        </div>
      </div>
      <div className="font-display font-bold text-2xl text-ink mt-0.5">
        {Number(item.qty).toLocaleString()}{" "}
        <span className="text-xs font-semibold text-muted">{item.unit}</span>
      </div>
      <div className="h-2 bg-line/60 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: statusColor[s] }}
        />
      </div>
    </div>
  );
}
