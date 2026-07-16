import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <div className="font-display font-bold text-2xl tracking-tight text-ink">
          BANTAY STOCK
        </div>
        <div className="text-sm text-muted font-semibold mt-1">
          Aggregates &amp; Hardware Supply
        </div>
      </div>
      <p className="text-ink-soft text-sm max-w-xs leading-relaxed">
        Track stock, log every transaction, and generate DENR reports —
        right from your phone.
      </p>
      <Link
        href="/login"
        className="bg-brand text-white font-bold text-sm px-6 py-3 rounded-xl active:scale-95 transition-transform"
      >
        Open Bantay Stock
      </Link>
    </main>
  );
}
