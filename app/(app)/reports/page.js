"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Printer } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";

function ReportsInner() {
  const [items, setItems] = useState([]);
  const [tx, setTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: itemRows }, { data: txRows }] = await Promise.all([
        supabase.from("items").select("*").order("name"),
        supabase.from("transactions").select("*"),
      ]);
      setItems(itemRows || []);
      setTx(txRows || []);
      setLoading(false);
    }
    load();
  }, []);

  const monthTx = useMemo(
    () => tx.filter((t) => t.created_at?.startsWith(month)),
    [tx, month]
  );

  const rows = useMemo(
    () =>
      items.map((it) => {
        const inQ = monthTx
          .filter((t) => t.item_id === it.id && t.type === "IN")
          .reduce((s, t) => s + Number(t.qty), 0);
        const outQ = monthTx
          .filter((t) => t.item_id === it.id && t.type === "OUT")
          .reduce((s, t) => s + Number(t.qty), 0);
        const ending = it.qty;
        const beginning = ending - inQ + outQ;
        return { ...it, inQ, outQ, beginning, ending };
      }),
    [items, monthTx]
  );

  if (loading) {
    return <div className="px-4 py-6 text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="px-4 pb-6">
      <div className="text-[11px] font-bold tracking-wide text-muted mb-2.5">
        DENR COMPLIANCE REPORT
      </div>

      <div className="flex gap-2">
        <input
          type="month"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            setGenerated(false);
          }}
          className="flex-1 border border-line rounded-lg px-3 py-2 text-sm font-semibold bg-surface"
        />
        <button
          onClick={() => setGenerated(true)}
          className="bg-brand text-white rounded-lg px-3.5 py-2 text-sm font-bold flex items-center gap-1.5"
        >
          <FileText size={16} strokeWidth={2.5} />
          Generate
        </button>
      </div>

      {generated && (
        <div className="mt-4 bg-surface border border-line rounded-xl p-3.5">
          <div className="border-b-2 border-ink pb-2 mb-2.5">
            <div className="text-[10px] font-bold tracking-wide text-muted">
              DENR SELF-MONITORING REPORT (SMR)
            </div>
            <div className="font-display font-bold text-[15px] text-ink">
              Reporting Period: {month}
            </div>
          </div>
          <table className="w-full border-collapse text-[11.5px]">
            <thead>
              <tr>
                <th className="text-left font-bold text-muted text-[10px] pb-1 border-b border-line">
                  Material
                </th>
                <th className="text-left font-bold text-muted text-[10px] pb-1 border-b border-line">
                  Unit
                </th>
                <th className="text-left font-bold text-muted text-[10px] pb-1 border-b border-line">
                  Begin
                </th>
                <th className="text-left font-bold text-muted text-[10px] pb-1 border-b border-line">
                  In
                </th>
                <th className="text-left font-bold text-muted text-[10px] pb-1 border-b border-line">
                  Out
                </th>
                <th className="text-left font-bold text-muted text-[10px] pb-1 border-b border-line">
                  End
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-1.5 font-semibold text-ink border-b border-line/60">
                    {r.name}
                  </td>
                  <td className="py-1.5 font-mono border-b border-line/60">{r.unit}</td>
                  <td className="py-1.5 font-mono border-b border-line/60">{r.beginning}</td>
                  <td className="py-1.5 font-mono border-b border-line/60">{r.inQ}</td>
                  <td className="py-1.5 font-mono border-b border-line/60">{r.outQ}</td>
                  <td className="py-1.5 font-mono border-b border-line/60">{r.ending}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => window.print()}
            className="w-full bg-ink text-white rounded-lg py-2.5 text-[12.5px] font-bold flex items-center justify-center gap-1.5 mt-3"
          >
            <Printer size={14} strokeWidth={2.5} />
            Print / Save as PDF
          </button>
          <p className="text-[10.5px] text-muted mt-2 leading-relaxed">
            This is a preview table. Swap it for an actual filled DENR SMR/CMR
            PDF template once you wire up a PDF library (e.g. pdf-lib) in an
            API route.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <RequireAuth ownerOnly>
      <ReportsInner />
    </RequireAuth>
  );
}
