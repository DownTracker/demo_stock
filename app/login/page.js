"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError("Wrong email or password. Please try again.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-surface border border-line rounded-2xl p-6"
      >
        <div className="font-display font-bold text-xl text-ink mb-1">
          DEMO Stock
        </div>
        <div className="text-xs text-muted font-semibold mb-6">
          Sign in to your account
        </div>

        <label className="text-xs font-bold text-muted block mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="username"
          className="w-full border border-line rounded-lg px-3 py-2.5 text-sm mb-4"
        />

        <label className="text-xs font-bold text-muted block mb-1">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full border border-line rounded-lg px-3 py-2.5 text-sm mb-2"
        />

        {error && (
          <div className="text-danger text-xs font-semibold mt-2">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white font-bold text-sm rounded-lg py-3 mt-4 active:scale-95 transition-transform disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <p className="text-[11px] text-muted mt-4 leading-relaxed">
          New staff accounts are created by the owner in the Admin tab —
          there's no self sign-up.
        </p>
      </form>
    </main>
  );
}
