"use client";

import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { fmtDateTime } from "@/lib/stock";

export default function HistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // items(name, unit) pulls the related item's name/unit through the
      // item_id foreign key in one query, instead of two round trips.
      const { data } = await supabase
        .from("transactions")
        .select("*, items(name, unit)")
        .order("created_at", { ascending: false });
      setRows(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="px-4 py-6 text-sm text-muted">Loading history…</div>;
  }

  return (
    <div className="px-4">
      <div className="text-[11px] font-bold tracking-wide text-muted mb-2.5">
        TRANSACTION HISTORY
      </div>
      <div className="flex flex-col gap-2 pb-6">
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
    </div>
  );
}
