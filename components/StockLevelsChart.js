"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { statusOf, statusColor } from "@/lib/stock";

export default function StockLevelsChart({ items }) {
  const data = items.map((it) => ({
    name: it.name.length > 14 ? it.name.slice(0, 13) + "…" : it.name,
    qty: it.qty,
    status: statusOf(it),
    unit: it.unit,
  }));

  return (
    <div className="bg-surface border border-line rounded-2xl p-4">
      <div className="text-[11px] font-bold tracking-wide text-muted mb-3">
        STOCK LEVELS AT A GLANCE
      </div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 8, top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3DFD3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10.5, fill: "#948F80" }}
              axisLine={{ stroke: "#D8D3C7" }}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fontSize: 10.5, fill: "#948F80" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #D8D3C7" }}
              formatter={(value, _n, ctx) => [`${value} ${ctx.payload.unit}`, "Qty"]}
            />
            <Bar dataKey="qty" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={statusColor[d.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
