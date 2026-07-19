import { statusOf, statusColor, statusLabel, fmtPeso } from "@/lib/stock";
import { SlidersHorizontal } from "lucide-react";

export default function StockCard({ item, onAdjust }) {
  const s = statusOf(item);
  const pct = Math.min(100, Math.round((item.qty / (item.threshold * 2)) * 100));

  return (
    <div className="bg-surface border border-line rounded-2xl px-4 py-3.5">
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

      <div className="flex items-end justify-between mt-0.5">
        <div className="font-display font-bold text-2xl text-ink">
          {Number(item.qty).toLocaleString()}{" "}
          <span className="text-xs font-semibold text-muted">{item.unit}</span>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-muted font-semibold">
            {fmtPeso(item.price)} / {item.unit}
          </div>
        </div>
      </div>

      <div className="h-2 bg-line/60 rounded-full mt-2.5 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: statusColor[s] }}
        />
      </div>

      {onAdjust && (
        <button
          onClick={() => onAdjust(item)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-ink-soft border border-line rounded-lg py-1.5 hover:bg-line/30 transition-colors"
        >
          <SlidersHorizontal size={12.5} strokeWidth={2.5} />
          Adjust (loss, damage, correction)
        </button>
      )}
    </div>
  );
}
