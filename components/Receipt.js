import { fmtPeso, fmtDateTime } from "@/lib/stock";
import { Printer, Plus } from "lucide-react";

export default function Receipt({ sale, lines, onPrint, onNewSale }) {
  return (
    <div>
      <div className="bg-surface border border-line rounded-2xl p-6 max-w-sm mx-auto">
        <div className="text-center mb-4">
          <div className="font-display font-bold text-base text-ink">
            DemoStock
          </div>
          <div className="text-[10.5px] text-muted font-semibold">
            Aggregates &amp; Hardware Supply
          </div>
        </div>

        <div className="border-t border-b border-dashed border-line py-2.5 mb-3 text-[11.5px] flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span className="text-ink-soft">Receipt #</span>
            <span className="font-mono text-ink">{sale.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Date</span>
            <span className="font-mono text-ink">{fmtDateTime(sale.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Sold by</span>
            <span className="font-mono text-ink">{sale.staff_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Buyer</span>
            <span className="font-mono text-ink">{sale.buyer_name}</span>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          {lines.map((l) => (
            <div key={l.id || l.item_id} className="text-[12.5px]">
              <div className="flex justify-between font-semibold text-ink">
                <span>{l.item_name}</span>
                <span className="font-mono">{fmtPeso(l.line_total)}</span>
              </div>
              <div className="text-[11px] text-muted">
                {l.qty} {l.item_unit} × {fmtPeso(l.unit_price)}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-line pt-3 space-y-1">
          <div className="flex justify-between text-[12.5px] text-ink-soft">
            <span>Subtotal</span>
            <span className="font-mono">{fmtPeso(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between font-bold text-ink">
            <span>Total</span>
            <span className="font-display text-lg">{fmtPeso(sale.total)}</span>
          </div>
          {sale.cash_tendered != null && (
            <>
              <div className="flex justify-between text-[12.5px] text-ink-soft">
                <span>Cash tendered</span>
                <span className="font-mono">{fmtPeso(sale.cash_tendered)}</span>
              </div>
              <div className="flex justify-between text-[12.5px] text-ink-soft">
                <span>Change</span>
                <span className="font-mono">{fmtPeso(sale.change_due)}</span>
              </div>
            </>
          )}
        </div>

        <div className="text-center text-[10.5px] text-muted mt-5">
          Thank you!
        </div>
      </div>

      <div className="no-print flex gap-2.5 max-w-sm mx-auto mt-4">
        <button
          onClick={onPrint}
          className="flex-1 bg-ink text-white rounded-xl py-3 text-[12.5px] font-bold flex items-center justify-center gap-1.5"
        >
          <Printer size={14} strokeWidth={2.5} />
          Print Receipt
        </button>
        {onNewSale && (
          <button
            onClick={onNewSale}
            className="flex-1 bg-brand text-white rounded-xl py-3 text-[12.5px] font-bold flex items-center justify-center gap-1.5"
          >
            <Plus size={14} strokeWidth={3} />
            New Sale
          </button>
        )}
      </div>
    </div>
  );
}
