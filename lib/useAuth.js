"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// A small hook every protected page uses to find out:
// - is anyone logged in?
// - are they the Owner or Staff?
// - is their account still active (not revoked)?
export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user || null;
      if (!active) return;
      setUser(sessionUser);

      if (sessionUser) {
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .single();
        if (active) setProfile(profileRow || null);
      }
      if (active) setLoading(false);
    }
    load();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) setProfile(null);
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}
