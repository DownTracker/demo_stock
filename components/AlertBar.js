import { AlertTriangle } from "lucide-react";

export default function AlertBar({ items }) {
  if (!items.length) return null;
  return (
    <div className="mx-4 mb-3 relative overflow-hidden rounded-xl bg-amber/20 px-3 py-2.5 flex gap-2">
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{
          background:
            "repeating-linear-gradient(135deg, #D79A2C 0, #D79A2C 4px, #3A2A12 4px, #3A2A12 8px)",
        }}
      />
      <AlertTriangle size={18} color="#3A2A12" className="shrink-0" />
      <div className="text-[13px] font-semibold text-[#3A2A12] leading-snug">
        Attention: {items.map((i) => i.name).join(", ")} running low. Please
        restock.
      </div>
    </div>
  );
}
