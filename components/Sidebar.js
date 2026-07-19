"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  Clock,
  FileText,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabaseClient";

const ALL_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: Package, ownerOnly: false },
  { href: "/pos", label: "New Sale", icon: ShoppingCart, ownerOnly: false },
  { href: "/history", label: "History", icon: Clock, ownerOnly: false },
  { href: "/reports", label: "Reports", icon: FileText, ownerOnly: true },
  { href: "/admin", label: "Admin", icon: ShieldCheck, ownerOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const router = useRouter();
  const isOwner = profile?.role === "Owner";
  const links = ALL_LINKS.filter((l) => !l.ownerOnly || isOwner);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="hidden md:flex md:flex-col md:w-60 md:shrink-0 bg-sidebar text-white min-h-screen sticky top-0 no-print">
      <div className="px-5 pt-7 pb-6">
        <div className="font-display font-bold text-lg tracking-tight">
          DemoStock
        </div>
        <div className="text-[11px] text-white/50 font-semibold mt-0.5">
          Aggregates &amp; Hardware Supply
        </div>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-1">
        {links.map((l) => {
          const Icon = l.icon;
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: active ? "rgba(255,255,255,0.08)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.6)",
              }}
            >
              <Icon size={17} strokeWidth={2.2} />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 pt-3 border-t border-white/10">
        <div className="px-3 py-2 text-[12px] font-semibold text-white/70">
          {isOwner ? "Owner" : `Staff · ${profile?.name || ""}`}
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={15} strokeWidth={2.2} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
