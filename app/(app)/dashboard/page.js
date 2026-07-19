"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";
import { statusOf } from "@/lib/stock";
import StockCard from "@/components/StockCard";
import AlertBar from "@/components/AlertBar";
import StockModal from "@/components/StockModal";
import StockLevelsChart from "@/components/StockLevelsChart";

export default function DashboardPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);

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

    await supabase.from("items").update({ qty: newQty }).eq("id", itemId);
    await supabase.from("transactions").insert({
      item_id: itemId,
      type: mode,
      qty,
      user_name: profile?.name || "Unknown",
      remarks: remarks || "-",
    });

    setAddOpen(false);
    setAdjustItem(null);
    loadItems();
  }

  if (loading) {
    return <div className="px-4 md:px-0 py-6 text-sm text-muted">Loading stock…</div>;
  }

  return (
    <div>
      <AlertBar items={lowItems} />

      <div className="px-4 md:px-0">
        <div className="flex gap-2.5 mb-5 md:mb-6 md:max-w-md">
          <button
            onClick={() => setAddOpen(true)}
            className="flex-1 bg-brand text-white rounded-2xl py-4 flex flex-col items-center gap-1.5 font-bold text-[13px] active:scale-95 transition-transform"
          >
            <Plus size={22} strokeWidth={3} />
            ADD STOCK
          </button>
          <Link
            href="/pos"
            className="flex-1 bg-ink text-white rounded-2xl py-4 flex flex-col items-center gap-1.5 font-bold text-[13px] active:scale-95 transition-transform"
          >
            <ShoppingCart size={22} strokeWidth={3} />
            NEW SALE
          </Link>
        </div>

        <div className="md:grid md:grid-cols-5 md:gap-6">
          <div className="md:col-span-3">
            <div className="text-[11px] font-bold tracking-wide text-muted mb-2.5">
              STOCK LEVELS
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-2.5 md:gap-3 pb-6">
              {items.map((item) => (
                <StockCard item={item} key={item.id} onAdjust={setAdjustItem} />
              ))}
              {items.length === 0 && (
                <div className="text-sm text-muted col-span-2">
                  No items yet — add rows to the `items` table in Supabase.
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2 md:pb-6">
            {items.length > 0 && <StockLevelsChart items={items} />}
          </div>
        </div>
      </div>

      {addOpen && (
        <StockModal
          mode="IN"
          items={items}
          onSubmit={handleStockSubmit}
          onClose={() => setAddOpen(false)}
        />
      )}

      {adjustItem && (
        <StockModal
          mode="OUT"
          allowToggle
          items={items}
          lockedItemId={adjustItem.id}
          onSubmit={handleStockSubmit}
          onClose={() => setAdjustItem(null)}
        />
      )}
    </div>
  );
}
