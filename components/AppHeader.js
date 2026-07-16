"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";
import { LogOut } from "lucide-react";

export default function AppHeader() {
  const { profile } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-3">
      <div>
        <div className="font-display font-bold text-base text-ink tracking-tight">
          BANTAY STOCK
        </div>
        <div className="text-[10px] text-muted font-semibold mt-0.5">
          Aggregates &amp; Hardware Supply
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-1.5 bg-surface border border-line rounded-full px-3 py-1.5 text-xs font-bold text-ink"
      >
        {profile?.role === "Owner" ? "Owner" : `Staff · ${profile?.name || ""}`}
        <LogOut size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
}
