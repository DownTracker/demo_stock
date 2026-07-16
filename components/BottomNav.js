"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Clock, FileText, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/useAuth";

const ALL_TABS = [
  { href: "/dashboard", label: "Home", icon: Package, ownerOnly: false },
  { href: "/history", label: "History", icon: Clock, ownerOnly: false },
  { href: "/reports", label: "Reports", icon: FileText, ownerOnly: true },
  { href: "/admin", label: "Admin", icon: ShieldCheck, ownerOnly: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const isOwner = profile?.role === "Owner";
  const tabs = ALL_TABS.filter((t) => !t.ownerOnly || isOwner);

  return (
    <div className="flex border-t border-line bg-background/95 backdrop-blur sticky bottom-0 pb-3 pt-2 px-1">
      {tabs.map((t) => {
        const Icon = t.icon;
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className="flex-1 flex flex-col items-center gap-1 py-1"
            style={{ color: active ? "#2F5D3A" : "#A6A192" }}
          >
            <Icon size={20} strokeWidth={active ? 2.6 : 2} />
            <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>
              {t.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
