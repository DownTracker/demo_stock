"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(sessionUser) {
    if (!sessionUser) {
      setProfile(null);
      return;
    }
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", sessionUser.id)
      .single();
    setProfile(profileRow || null);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user || null;
      if (!active) return;
      setUser(sessionUser);
      await fetchProfile(sessionUser);
      if (active) setLoading(false);
    }
    load();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user || null;
      setUser(sessionUser);
      await fetchProfile(sessionUser);
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}
