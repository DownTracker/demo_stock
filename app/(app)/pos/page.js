"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Minus, Trash2, Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";
import { fmtPeso } from "@/lib/stock";
import Receipt from "@/components/Receipt";

export default function PosPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]); // { itemId, name, unit, maxQty, unitPrice, qty }
  const [buyerName, setBuyerName] = useState("");
  const [cashTendered, setCashTendered] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [completedSale, setCompletedSale] = useState(null); // { sale, lines }

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("items").select("*").order("name");
      setItems(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === item.id);
      if (existing) {
        if (existing.qty >= item.qty) return prev;
        return prev.map((l) =>
          l.itemId === item.id ? { ...l, qty: l.qty + 1 } : l
        );
      }
      if (item.qty <= 0) return prev;
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          unit: item.unit,
          maxQty: item.qty,
          unitPrice: item.price,
          qty: 1,
        },
      ];
    });
  }

  function updateLine(itemId, patch) {
    setCart((prev) =>
      prev.map((l) => (l.itemId === itemId ? { ...l, ...patch } : l))
    );
  }

  function removeLine(itemId) {
    setCart((prev) => prev.filter((l) => l.itemId !== itemId));
  }

  const subtotal = useMemo(
    () => cart.reduce((s, l) => s + Number(l.unitPrice) * Number(l.qty), 0),
    [cart]
  );
  const total = subtotal; // room for tax/fees later without touching the checkout flow
  const cashNum = Number(cashTendered);
  const changeDue = cashTendered !== "" ? Math.max(0, cashNum - total) : null;

  async function handleCheckout() {
    setError("");
    if (!buyerName.trim()) {
      setError("Buyer name is required.");
      return;
    }
    if (cart.length === 0) {
      setError("Add at least one item to the cart.");
      return;
    }
    for (const l of cart) {
      if (l.qty <= 0) {
        setError(`Quantity for ${l.name} must be more than 0.`);
        return;
      }
    }

    setSaving(true);
    const staffName = profile?.name || "Unknown";

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        buyer_name: buyerName.trim(),
        staff_name: staffName,
        subtotal,
        total,
        cash_tendered: cashTendered !== "" ? cashNum : null,
        change_due: cashTendered !== "" ? changeDue : null,
      })
      .select()
      .single();

    if (saleError || !sale) {
      setError("Could not save the sale. Please try again.");
      setSaving(false);
      return;
    }

    const saleItemRows = cart.map((l) => ({
      sale_id: sale.id,
      item_id: l.itemId,
      item_name: l.name,
      item_unit: l.unit,
      qty: l.qty,
      unit_price: l.unitPrice,
      line_total: l.unitPrice * l.qty,
    }));
    await supabase.from("sale_items").insert(saleItemRows);

    // Log to transactions (keeps History + DENR reports working off the
    // same data) and reduce each item's stock.
    for (const l of cart) {
      const item = items.find((i) => i.id === l.itemId);
      const newQty = Math.max(0, (item?.qty || 0) - l.qty);
      await supabase.from("items").update({ qty: newQty }).eq("id", l.itemId);
      await supabase.from("transactions").insert({
        item_id: l.itemId,
        type: "OUT",
        qty: l.qty,
        user_name: staffName,
        remarks: `Sale to ${buyerName.trim()} (Receipt #${sale.id.slice(0, 8).toUpperCase()})`,
      });
    }

    setCompletedSale({ sale, lines: saleItemRows });
    setSaving(false);
  }

  function resetForNewSale() {
    setCompletedSale(null);
    setCart([]);
    setBuyerName("");
    setCashTendered("");
    setError("");
    // refresh item quantities shown in the picker
    supabase
      .from("items")
      .select("*")
      .order("name")
      .then(({ data }) => setItems(data || []));
  }

  if (loading) {
    return <div className="px-4 md:px-0 py-6 text-sm text-muted">Loading…</div>;
  }

  if (completedSale) {
    return (
      <div className="px-4 md:px-0 py-4">
        <Receipt
          sale={completedSale.sale}
          lines={completedSale.lines}
          onPrint={() => window.print()}
          onNewSale={resetForNewSale}
        />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-0 pb-6">
      <div className="text-[11px] font-bold tracking-wide text-muted mb-2.5 mt-1">
        NEW SALE
      </div>

      <div className="md:grid md:grid-cols-5 md:gap-6">
        {/* item picker */}
        <div className="md:col-span-3">
          <div className="relative mb-3">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items…"
              className="w-full border border-line rounded-lg pl-9 pr-3 py-2.5 text-sm bg-surface"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {filteredItems.map((item) => {
              const inCart = cart.find((l) => l.itemId === item.id);
              const soldOut = item.qty <= 0;
              return (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  disabled={soldOut || (inCart && inCart.qty >= item.qty)}
                  className="text-left bg-surface border border-line rounded-xl p-3.5 disabled:opacity-40 active:scale-95 transition-transform"
                >
                  <div className="font-bold text-[13px] text-ink">{item.name}</div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {soldOut ? "Out of stock" : `${item.qty} ${item.unit} available`}
                  </div>
                  <div className="text-[13px] font-mono font-semibold text-brand mt-1.5">
                    {fmtPeso(item.price)}{" "}
                    <span className="text-[10.5px] text-muted font-sans">
                      / {item.unit}
                    </span>
                  </div>
                </button>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="text-sm text-muted col-span-2">No items match.</div>
            )}
          </div>
        </div>

        {/* cart + checkout */}
        <div className="md:col-span-2 mt-6 md:mt-0">
          <div className="bg-surface border border-line rounded-2xl p-4 md:sticky md:top-6">
            <div className="text-[11px] font-bold tracking-wide text-muted mb-3">
              CART
            </div>

            {cart.length === 0 ? (
              <div className="text-[13px] text-muted py-4 text-center">
                Tap an item to add it to the sale.
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-3">
                {cart.map((l) => (
                  <div key={l.itemId} className="border-b border-line/60 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[13px] font-bold text-ink">{l.name}</div>
                      <button
                        onClick={() => removeLine(l.itemId)}
                        className="text-muted hover:text-danger shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-line rounded-lg">
                        <button
                          onClick={() =>
                            updateLine(l.itemId, { qty: Math.max(1, l.qty - 1) })
                          }
                          className="w-7 h-7 flex items-center justify-center text-ink-soft"
                        >
                          <Minus size={12} strokeWidth={2.5} />
                        </button>
                        <input
                          type="number"
                          value={l.qty}
                          min="1"
                          max={l.maxQty}
                          onChange={(e) =>
                            updateLine(l.itemId, {
                              qty: Math.min(
                                l.maxQty,
                                Math.max(1, Number(e.target.value) || 1)
                              ),
                            })
                          }
                          className="w-10 text-center text-[12.5px] font-bold outline-none"
                        />
                        <button
                          onClick={() =>
                            updateLine(l.itemId, {
                              qty: Math.min(l.maxQty, l.qty + 1),
                            })
                          }
                          className="w-7 h-7 flex items-center justify-center text-ink-soft"
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                      <span className="text-[11px] text-muted">{l.unit} ×</span>
                      <input
                        type="number"
                        value={l.unitPrice}
                        min="0"
                        step="0.01"
                        onChange={(e) =>
                          updateLine(l.itemId, {
                            unitPrice: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="w-20 border border-line rounded-lg px-2 py-1 text-[12.5px] font-mono text-right"
                      />
                      <span className="ml-auto text-[13px] font-mono font-bold text-ink">
                        {fmtPeso(l.unitPrice * l.qty)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label className="text-[11px] font-bold text-muted block mb-1">
              Buyer name
            </label>
            <input
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm mb-3"
            />

            <label className="text-[11px] font-bold text-muted block mb-1">
              Cash tendered (optional)
            </label>
            <input
              type="number"
              min="0"
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
              placeholder="0.00"
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm mb-3"
            />

            <div className="border-t border-line pt-3 space-y-1.5">
              <div className="flex justify-between text-[13px]">
                <span className="text-ink-soft">Subtotal</span>
                <span className="font-mono text-ink">{fmtPeso(subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-ink">Total</span>
                <span className="font-display text-lg text-ink">{fmtPeso(total)}</span>
              </div>
              {changeDue !== null && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-ink-soft">Change</span>
                  <span className="font-mono text-ink">{fmtPeso(changeDue)}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="text-danger text-xs font-semibold mt-3">{error}</div>
            )}

            <button
              onClick={handleCheckout}
              disabled={saving}
              className="w-full bg-brand text-white rounded-xl py-3.5 mt-4 text-sm font-bold active:scale-95 transition-transform disabled:opacity-60"
            >
              {saving ? "Processing…" : `Confirm Sale · ${fmtPeso(total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
