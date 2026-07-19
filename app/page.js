import Link from "next/link";
import { Package, Receipt, FileCheck2, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Package,
    title: "Live stock levels",
    body: "Every item shows a traffic-light status the moment it dips toward reorder — no spreadsheet to refresh.",
  },
  {
    icon: Receipt,
    title: "Point of sale",
    body: "Ring up a sale with per-line pricing, bulk discounts, and a printable receipt — stock updates itself.",
  },
  {
    icon: FileCheck2,
    title: "DENR reporting",
    body: "Monthly Self-Monitoring Reports assemble themselves from real transaction history, ready to print.",
  },
  {
    icon: ShieldCheck,
    title: "Accountable by design",
    body: "Every addition, sale, and adjustment is logged with who, what, and why — staff never touch raw data.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        {/* nav */}
        <div className="flex items-center justify-between py-6">
          <div className="font-display font-bold text-lg tracking-tight text-ink">
            DemoStock
          </div>
          <Link
            href="/login"
            className="bg-ink text-white text-sm font-bold px-4 py-2 rounded-lg active:scale-95 transition-transform"
          >
            Sign In
          </Link>
        </div>

        {/* hero */}
        <div className="grid md:grid-cols-2 gap-10 items-center py-10 md:py-20">
          <div>
            <div className="inline-block text-[11px] font-bold tracking-wide text-brand bg-brand/10 px-2.5 py-1 rounded-full mb-4">
              BUILT FOR AGGREGATES &amp; HARDWARE SUPPLY
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-ink leading-[1.08] tracking-tight">
              Run the yard from your phone. Report to DENR from the same
              screen.
            </h1>
            <p className="text-ink-soft text-base mt-5 leading-relaxed max-w-md">
              Stock tracking, point of sale, and government compliance
              reporting in one place — simple enough for staff on day one,
              thorough enough for audit season.
            </p>
            <div className="flex gap-3 mt-8">
              <Link
                href="/login"
                className="bg-brand text-white font-bold text-sm px-6 py-3.5 rounded-xl active:scale-95 transition-transform"
              >
                Open DemoStock
              </Link>
            </div>
          </div>

          {/* receipt-style preview card — signature element */}
          <div className="relative">
            <div className="bg-surface border border-line rounded-2xl shadow-xl p-6 relative">
              <div className="flex items-center justify-between border-b border-dashed border-line pb-3 mb-3">
                <div className="font-display font-bold text-sm text-ink">
                  Sales Receipt
                </div>
                <div className="text-[10px] font-mono text-muted">
                  #A1024
                </div>
              </div>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-ink-soft">Portland Cement × 20</span>
                  <span className="font-mono text-ink">₱5,100.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">Hollow Blocks 4&quot; × 150</span>
                  <span className="font-mono text-ink">₱1,800.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">Bulk discount</span>
                  <span className="font-mono text-danger">-₱300.00</span>
                </div>
              </div>
              <div className="border-t border-dashed border-line mt-3 pt-3 flex justify-between">
                <span className="font-bold text-sm text-ink">Total</span>
                <span className="font-display font-bold text-lg text-ink">
                  ₱6,600.00
                </span>
              </div>
              {/* perforated edge */}
              <div
                className="absolute left-0 right-0 -bottom-2 h-4"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 8px 0, transparent 7px, var(--background) 7px)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 -8px",
                }}
              />
            </div>
          </div>
        </div>

        {/* features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-20">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-surface border border-line rounded-2xl p-5"
              >
                <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center mb-3">
                  <Icon size={18} strokeWidth={2.2} className="text-brand" />
                </div>
                <div className="font-bold text-sm text-ink mb-1.5">
                  {f.title}
                </div>
                <div className="text-[13px] text-ink-soft leading-relaxed">
                  {f.body}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-[11px] text-muted pb-10">
          DemoStock is set up individually for each business — this instance
          is a working demo.
        </div>
      </div>
    </main>
  );
}
