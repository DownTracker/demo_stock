"use client";

import { useEffect, useState } from "react";
import { UserPlus, Ban, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";

function AdminInner() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadUsers() {
    const { data } = await supabase.from("profiles").select("*").order("name");
    setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function toggleStatus(u) {
    const next = u.status === "active" ? "revoked" : "active";
    await supabase.from("profiles").update({ status: next }).eq("id", u.id);
    loadUsers();
  }

  async function createStaff() {
    setError("");
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Fill in a name, email, and a password of at least 6 characters.");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/create-staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const result = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(result.error || "Could not create the account.");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    setFormOpen(false);
    loadUsers();
  }

  if (loading) {
    return <div className="px-4 py-6 text-sm text-muted">Loading users…</div>;
  }

  return (
    <div className="px-4 pb-6">
      <div className="text-[11px] font-bold tracking-wide text-muted mb-2.5">
        USER ACCOUNTS
      </div>
      <div className="flex flex-col gap-2">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between bg-surface border border-line rounded-xl px-3.5 py-2.5"
          >
            <div>
              <div className="text-[13.5px] font-bold text-ink">{u.name}</div>
              <div className="text-[11.5px] text-muted">{u.role}</div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10.5px] font-bold px-2 py-1 rounded-full uppercase"
                style={{
                  background: u.status === "active" ? "#EAF3EB" : "#F2E9E8",
                  color: u.status === "active" ? "#3C7A45" : "#946B65",
                }}
              >
                {u.status === "active" ? "Active" : "Revoked"}
              </span>
              {u.role !== "Owner" && (
                <button
                  onClick={() => toggleStatus(u)}
                  className="w-7 h-7 rounded-lg border border-line bg-surface flex items-center justify-center"
                >
                  {u.status === "active" ? <Ban size={14} /> : <RotateCcw size={14} />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!formOpen ? (
        <button
          onClick={() => setFormOpen(true)}
          className="w-full mt-3.5 border-[1.5px] border-dashed border-line rounded-xl py-2.5 text-[12.5px] font-bold text-ink flex items-center justify-center gap-1.5"
        >
          <UserPlus size={16} strokeWidth={2.5} />
          Add Staff Account
        </button>
      ) : (
        <div className="mt-3.5 bg-surface border border-line rounded-xl p-3 flex flex-col gap-2">
          <input
            placeholder="Staff name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-line rounded-lg px-2.5 py-2 text-sm"
          />
          <input
            placeholder="Login email (e.g. ramon@bantaystock.local)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-line rounded-lg px-2.5 py-2 text-sm"
          />
          <input
            placeholder="Temporary password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-line rounded-lg px-2.5 py-2 text-sm"
          />
          {error && (
            <div className="text-danger text-xs font-semibold">{error}</div>
          )}
          <div className="flex gap-2">
            <button
              onClick={createStaff}
              disabled={creating}
              className="flex-1 bg-brand text-white rounded-lg py-2 text-[12.5px] font-bold disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create"}
            </button>
            <button
              onClick={() => {
                setFormOpen(false);
                setError("");
              }}
              className="flex-1 bg-line/50 text-ink rounded-lg py-2 text-[12.5px] font-bold"
            >
              Cancel
            </button>
          </div>
          <div className="text-[10.5px] text-muted leading-relaxed">
            The email doesn't need to be real — it's just their username. Tell
            them the password in person; no email gets sent.
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth ownerOnly>
      <AdminInner />
    </RequireAuth>
  );
}
