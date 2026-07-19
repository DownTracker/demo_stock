"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Printer } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";
import { fmtPeso, fmtDate } from "@/lib/stock";

function ReportsInner() {
  const [items, setItems] = useState([]);
  const [tx, setTx] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: itemRows }, { data: txRows }, { data: saleRows }] = await Promise.all([
        supabase.from("items").select("*").order("name"),
        supabase.from("transactions").select("*"),
        supabase.from("sales").select("*").order("created_at"),
      ]);
      setItems(itemRows || []);
      setTx(txRows || []);
      setSales(saleRows || []);
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

  // last 14 days of revenue, one point per day
  const revenueByDay = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayTotal = sales
        .filter((s) => s.created_at?.startsWith(key))
        .reduce((sum, s) => sum + Number(s.total), 0);
      days.push({ label: d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }), total: dayTotal });
    }
    return days;
  }, [sales]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayRevenue = sales
    .filter((s) => s.created_at?.startsWith(todayKey))
    .reduce((s, x) => s + Number(x.total), 0);
  const monthRevenue = sales
    .filter((s) => s.created_at?.startsWith(month))
    .reduce((s, x) => s + Number(x.total), 0);
  const monthSalesCount = sales.filter((s) => s.created_at?.startsWith(month)).length;

  if (loading) {
    return <div className="px-4 md:px-0 py-6 text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="px-4 md:px-0 pb-6">
      <div className="text-[11px] font-bold tracking-wide text-muted mb-2.5 mt-1">
        REPORTS &amp; REVENUE
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-3 gap-2.5 md:gap-3 mb-5">
        <div className="bg-surface border border-line rounded-2xl p-3.5">
          <div className="text-[10.5px] font-semibold text-muted">Today</div>
          <div className="font-display font-bold text-base md:text-xl text-ink mt-0.5">
            {fmtPeso(todayRevenue)}
          </div>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-3.5">
          <div className="text-[10.5px] font-semibold text-muted">This Month</div>
          <div className="font-display font-bold text-base md:text-xl text-ink mt-0.5">
            {fmtPeso(monthRevenue)}
          </div>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-3.5">
          <div className="text-[10.5px] font-semibold text-muted">Sales</div>
          <div className="font-display font-bold text-base md:text-xl text-ink mt-0.5">
            {monthSalesCount}
          </div>
        </div>
      </div>

      {/* revenue chart */}
      <div className="bg-surface border border-line rounded-2xl p-4 mb-5">
        <div className="text-[11px] font-bold tracking-wide text-muted mb-3">
          REVENUE — LAST 14 DAYS
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueByDay} margin={{ left: -10, right: 10, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3DFD3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#948F80" }}
                axisLine={{ stroke: "#D8D3C7" }}
                tickLine={false}
                interval={2}
              />
              <YAxis tick={{ fontSize: 10, fill: "#948F80" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #D8D3C7" }}
                formatter={(v) => [fmtPeso(v), "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3E6B8A"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DENR report */}
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
          className="flex-1 md:flex-none md:w-56 border border-line rounded-lg px-3 py-2 text-sm font-semibold bg-surface"
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
        <div className="mt-4 bg-surface border border-line rounded-xl p-3.5 md:max-w-2xl">
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
            className="no-print w-full bg-ink text-white rounded-lg py-2.5 text-[12.5px] font-bold flex items-center justify-center gap-1.5 mt-3"
          >
            <Printer size={14} strokeWidth={2.5} />
            Print / Save as PDF
          </button>
          <p className="no-print text-[10.5px] text-muted mt-2 leading-relaxed">
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
