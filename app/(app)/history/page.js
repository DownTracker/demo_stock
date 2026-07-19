"use client";

import { useEffect, useState } from "react";
import { Plus, Minus, Receipt as ReceiptIcon, X, Printer } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { fmtDateTime, fmtPeso } from "@/lib/stock";
import Receipt from "@/components/Receipt";

export default function HistoryPage() {
  const [view, setView] = useState("stock"); // "stock" | "sales"
  const [rows, setRows] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSale, setOpenSale] = useState(null); // { sale, lines }

  useEffect(() => {
    async function load() {
      const [{ data: txRows }, { data: saleRows }] = await Promise.all([
        supabase
          .from("transactions")
          .select("*, items(name, unit)")
          .order("created_at", { ascending: false }),
        supabase.from("sales").select("*").order("created_at", { ascending: false }),
      ]);
      setRows(txRows || []);
      setSales(saleRows || []);
      setLoading(false);
    }
    load();
  }, []);

  async function openReceipt(sale) {
    const { data: lines } = await supabase
      .from("sale_items")
      .select("*")
      .eq("sale_id", sale.id);
    setOpenSale({ sale, lines: lines || [] });
  }

  if (loading) {
    return <div className="px-4 md:px-0 py-6 text-sm text-muted">Loading history…</div>;
  }

  return (
    <div className="px-4 md:px-0 pb-6">
      <div className="flex items-center justify-between mb-3 mt-1">
        <div className="text-[11px] font-bold tracking-wide text-muted">
          {view === "stock" ? "TRANSACTION HISTORY" : "SALES HISTORY"}
        </div>
        <div className="flex bg-line/40 rounded-lg p-0.5">
          <button
            onClick={() => setView("stock")}
            className="px-3 py-1.5 rounded-md text-[11.5px] font-bold"
            style={{
              background: view === "stock" ? "#fff" : "transparent",
              color: view === "stock" ? "#23211D" : "#948F80",
            }}
          >
            Stock Log
          </button>
          <button
            onClick={() => setView("sales")}
            className="px-3 py-1.5 rounded-md text-[11.5px] font-bold"
            style={{
              background: view === "sales" ? "#fff" : "transparent",
              color: view === "sales" ? "#23211D" : "#948F80",
            }}
          >
            Sales
          </button>
        </div>
      </div>

      {view === "stock" ? (
        <div className="grid md:grid-cols-2 gap-2 md:gap-x-4">
          {rows.map((t) => (
            <div
              key={t.id}
              className="flex gap-2.5 bg-surface border border-line rounded-xl px-3 py-2.5"
            >
              <div
                className="w-[26px] h-[26px] rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: t.type === "IN" ? "#EAF3EB" : "#FBEAE8",
                  color: t.type === "IN" ? "#3C7A45" : "#C1443A",
                }}
              >
                {t.type === "IN" ? (
                  <Plus size={14} strokeWidth={3} />
                ) : (
                  <Minus size={14} strokeWidth={3} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold text-ink">
                  {t.items?.name} · {t.qty} {t.items?.unit}
                </div>
                <div className="text-xs text-ink-soft mt-0.5">{t.remarks}</div>
                <div className="text-[11px] text-muted mt-0.5 font-mono">
                  {t.user_name} · {fmtDateTime(t.created_at)}
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="text-sm text-muted">No transactions yet.</div>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-2 md:gap-x-4">
          {sales.map((s) => (
            <button
              key={s.id}
              onClick={() => openReceipt(s)}
              className="text-left flex gap-2.5 bg-surface border border-line rounded-xl px-3 py-2.5"
            >
              <div className="w-[26px] h-[26px] rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <ReceiptIcon size={14} strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-[13.5px] font-bold text-ink">{s.buyer_name}</div>
                  <div className="text-[13px] font-mono font-bold text-ink">
                    {fmtPeso(s.total)}
                  </div>
                </div>
                <div className="text-[11px] text-muted mt-0.5 font-mono">
                  #{s.id.slice(0, 8).toUpperCase()} · {s.staff_name} ·{" "}
                  {fmtDateTime(s.created_at)}
                </div>
              </div>
            </button>
          ))}
          {sales.length === 0 && (
            <div className="text-sm text-muted">No sales yet.</div>
          )}
        </div>
      )}

      {openSale && (
        <div
          className="fixed inset-0 bg-ink/45 flex items-center justify-center z-50 p-4 no-print"
          onClick={() => setOpenSale(null)}
        >
          <div
            className="bg-background rounded-2xl p-5 max-h-[90vh] overflow-y-auto w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setOpenSale(null)}
                className="w-8 h-8 rounded-lg bg-line/40 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <Receipt
              sale={openSale.sale}
              lines={openSale.lines}
              onPrint={() => window.print()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
