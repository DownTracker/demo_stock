"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Minus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";
import { statusOf } from "@/lib/stock";
import StockCard from "@/components/StockCard";
import AlertBar from "@/components/AlertBar";
import StockModal from "@/components/StockModal";

export default function DashboardPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // "IN" | "OUT" | null

  const loadItems = useCallback(async () => {
    const { data } = await supabase.from("items").select("*").order("name");
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const lowItems = items.filter((i) => statusOf(i) === "red");

  async function handleStockSubmit(itemId, mode, qty, remarks) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const newQty = mode === "IN" ? item.qty + qty : Math.max(0, item.qty - qty);

    // 1. update the item's quantity
    await supabase.from("items").update({ qty: newQty }).eq("id", itemId);

    // 2. log the transaction so it shows up in History
    await supabase.from("transactions").insert({
      item_id: itemId,
      type: mode,
      qty,
      user_name: profile?.name || "Unknown",
      remarks: remarks || "-",
    });

    setModalMode(null);
    loadItems();
  }

  if (loading) {
    return <div className="px-4 py-6 text-sm text-muted">Loading stock…</div>;
  }

  return (
    <div>
      <AlertBar items={lowItems} />

      <div className="px-4">
        <div className="flex gap-2.5 mb-5">
          <button
            onClick={() => setModalMode("IN")}
            className="flex-1 bg-brand text-white rounded-2xl py-4 flex flex-col items-center gap-1.5 font-bold text-[13px] active:scale-95 transition-transform"
          >
            <Plus size={22} strokeWidth={3} />
            ADD STOCK
          </button>
          <button
            onClick={() => setModalMode("OUT")}
            className="flex-1 bg-danger text-white rounded-2xl py-4 flex flex-col items-center gap-1.5 font-bold text-[13px] active:scale-95 transition-transform"
          >
            <Minus size={22} strokeWidth={3} />
            REDUCE STOCK
          </button>
        </div>

        <div className="text-[11px] font-bold tracking-wide text-muted mb-2.5">
          STOCK LEVELS
        </div>
        <div className="flex flex-col gap-2.5 pb-6">
          {items.map((item) => (
            <StockCard item={item} key={item.id} />
          ))}
          {items.length === 0 && (
            <div className="text-sm text-muted">
              No items yet — add rows to the `items` table in Supabase.
            </div>
          )}
        </div>
      </div>

      {modalMode && (
        <StockModal
          mode={modalMode}
          items={items}
          onSubmit={handleStockSubmit}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  );
}
