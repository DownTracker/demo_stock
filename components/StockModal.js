"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";

export default function StockModal({ mode, items, onSubmit, onClose }) {
  const [itemId, setItemId] = useState(items[0]?.id || "");
  const [qty, setQty] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const isIn = mode === "IN";

  async function handleSubmit() {
    const q = Number(qty);
    if (!q || q <= 0 || !itemId) return;
    setSaving(true);
    await onSubmit(itemId, mode, q, remarks);
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 bg-ink/45 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-2xl w-full max-w-md px-5 pt-5 pb-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="font-display font-bold text-lg text-ink">
            {isIn ? "Add Stock" : "Reduce Stock"}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-line/40 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <label className="text-[11px] font-bold text-muted block mb-1">
          Item
        </label>
        <select
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2.5 text-sm font-semibold mb-3"
        >
          {items.map((it) => (
            <option value={it.id} key={it.id}>
              {it.name} ({it.qty} {it.unit} left)
            </option>
          ))}
        </select>

        <label className="text-[11px] font-bold text-muted block mb-1">
          Quantity
        </label>
        <input
          type="number"
          min="0"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="0"
          autoFocus
          className="w-full border border-line rounded-lg px-3 py-2.5 text-base font-bold mb-3"
        />

        <label className="text-[11px] font-bold text-muted block mb-1">
          Remarks (who / why)
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={2}
          placeholder={isIn ? "e.g. Delivery from supplier" : "e.g. Sold to walk-in customer"}
          className="w-full border border-line rounded-lg px-3 py-2.5 text-sm resize-none"
        />

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full text-white font-bold text-sm rounded-xl py-3 mt-4 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
          style={{ background: isIn ? "#2F5D3A" : "#A6403A" }}
        >
          {isIn ? <Plus size={18} strokeWidth={3} /> : <Minus size={18} strokeWidth={3} />}
          {saving ? "Saving…" : `Confirm ${isIn ? "Addition" : "Reduction"}`}
        </button>
      </div>
    </div>
  );
}
