"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";

// mode: initial IN/OUT selection.
// allowToggle: if true, shows IN/OUT switch (used for manual per-item
// adjustments like loss/damage, where either direction is plausible).
// lockedItemId: if set, the item dropdown is replaced with a fixed label
// (used when opened from a specific stock card).
export default function StockModal({
  mode: initialMode,
  items,
  lockedItemId,
  allowToggle = false,
  onSubmit,
  onClose,
}) {
  const [mode, setMode] = useState(initialMode);
  const [itemId, setItemId] = useState(lockedItemId || items[0]?.id || "");
  const [qty, setQty] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const isIn = mode === "IN";
  const lockedItem = lockedItemId ? items.find((i) => i.id === lockedItemId) : null;

  async function handleSubmit() {
    const q = Number(qty);
    if (!q || q <= 0 || !itemId) return;
    setSaving(true);
    await onSubmit(itemId, mode, q, remarks);
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 bg-ink/45 flex items-end md:items-center justify-center z-50 no-print"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-2xl md:rounded-2xl w-full max-w-md px-5 pt-5 pb-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="font-display font-bold text-lg text-ink">
            {allowToggle ? "Adjust Stock" : isIn ? "Add Stock" : "Reduce Stock"}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-line/40 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {allowToggle && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode("IN")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12.5px] font-bold border"
              style={{
                background: isIn ? "#2F5D3A" : "transparent",
                color: isIn ? "#fff" : "#3E3B33",
                borderColor: isIn ? "#2F5D3A" : "#E3DFD3",
              }}
            >
              <Plus size={14} strokeWidth={3} /> Add
            </button>
            <button
              onClick={() => setMode("OUT")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12.5px] font-bold border"
              style={{
                background: !isIn ? "#A6403A" : "transparent",
                color: !isIn ? "#fff" : "#3E3B33",
                borderColor: !isIn ? "#A6403A" : "#E3DFD3",
              }}
            >
              <Minus size={14} strokeWidth={3} /> Remove
            </button>
          </div>
        )}

        <label className="text-[11px] font-bold text-muted block mb-1">
          Item
        </label>
        {lockedItem ? (
          <div className="w-full border border-line rounded-lg px-3 py-2.5 text-sm font-semibold mb-3 bg-line/20 text-ink">
            {lockedItem.name} ({lockedItem.qty} {lockedItem.unit} left)
          </div>
        ) : (
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
        )}

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
          placeholder={
            allowToggle
              ? "e.g. Damaged in storage, count correction"
              : isIn
              ? "e.g. Delivery from supplier"
              : "e.g. Sold to walk-in customer"
          }
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
