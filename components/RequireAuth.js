"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

// Wrap any protected page's content with <RequireAuth> to send visitors
// to /login if they're not signed in, or back to /dashboard if their
// role isn't allowed to see this page (e.g. Staff hitting /admin).
export default function RequireAuth({ ownerOnly = false, children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (profile?.status === "revoked") {
      router.replace("/login");
      return;
    }
    if (ownerOnly && profile?.role !== "Owner") {
      router.replace("/dashboard");
    }
  }, [loading, user, profile, ownerOnly, router]);

  if (loading || !user || (ownerOnly && profile?.role !== "Owner")) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Loading…
      </div>
    );
  }

  return children;
}
