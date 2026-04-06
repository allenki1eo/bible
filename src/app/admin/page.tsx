"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";

// ── Auth guard ────────────────────────────────────────────────────────────────
// Admins are identified by email. Set NEXT_PUBLIC_ADMIN_EMAILS in your Vercel
// environment variables as a comma-separated list: "you@email.com,other@email.com"
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// ── Types ─────────────────────────────────────────────────────────────────────
interface AppStats {
  users: number;
  stories: number;
  testimonies: number;
  prayers: number;
  subscribers: number;
  completedDevotions: number;
}

interface UserRow {
  id: string;
  display_name: string;
  language: string;
  created_at: string;
}

interface TestimonyRow {
  id: string;
  content: string;
  is_anonymous: boolean;
  moderation_status: string;
  created_at: string;
}

interface NotifForm {
  title: string;
  body: string;
  url: string;
}

interface VapidStatus {
  configured: boolean;
  publicKey?: string;
  error?: string;
}

// ── Tiny UI helpers ───────────────────────────────────────────────────────────
function Stat({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="text-2xl mb-0.5">{icon}</div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-white/70 mt-0.5">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <h2 className="font-semibold text-sm text-white/90">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<AppStats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [flagged, setFlagged] = useState<TestimonyRow[]>([]);
  const [recentTestimonies, setRecentTestimonies] = useState<TestimonyRow[]>([]);
  const [notifForm, setNotifForm] = useState<NotifForm>({ title: "Nuru 🌟", body: "", url: "/en/devotions" });
  const [notifStatus, setNotifStatus] = useState("");
  const [vapidStatus, setVapidStatus] = useState<VapidStatus | null>(null);
  const [generatedKeys, setGeneratedKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "content" | "push">("overview");

  // ── Check existing session on mount ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        setAuthed(true);
        loadData();
      }
    })();
  }, []);

  // ── Sign in ───────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const userEmail = data.user?.email?.toLowerCase() ?? "";
      if (!ADMIN_EMAILS.includes(userEmail)) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }
      setAuthed(true);
      loadData();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Login failed");
    }
    setLoading(false);
  };

  // ── Load all dashboard data ───────────────────────────────────────────────
  const loadData = useCallback(async () => {
    // Use the server-side stats API for counts that need the service role key
    // (push_subscriptions is protected by RLS, so browser client returns 0)
    const res = await fetch("/api/stats");
    const data = await res.json();

    const supabase = createBrowserClient();

    const [
      { data: userRows },
      { data: flaggedRows },
      { data: recentRows },
    ] = await Promise.all([
      supabase.from("profiles").select("id, display_name, language, created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("testimonies").select("id, content, is_anonymous, moderation_status, created_at").eq("moderation_status", "flagged").limit(20),
      supabase.from("testimonies").select("id, content, is_anonymous, moderation_status, created_at").order("created_at", { ascending: false }).limit(10),
    ]);

    setStats(data);
    setUsers(userRows ?? []);
    setFlagged(flaggedRows ?? []);
    setRecentTestimonies(recentRows ?? []);

    // Check VAPID key status
    const vapidRes = await fetch("/api/notifications/vapid-key");
    if (vapidRes.ok) {
      const { publicKey } = await vapidRes.json();
      setVapidStatus({ configured: true, publicKey });
    } else {
      const { error } = await vapidRes.json().catch(() => ({ error: "Unknown error" }));
      setVapidStatus({ configured: false, error });
    }
  }, []);

  // ── Approve/delete testimony ──────────────────────────────────────────────
  const moderateTestimony = async (id: string, action: "approve" | "delete") => {
    const supabase = createBrowserClient();
    if (action === "approve") {
      await supabase.from("testimonies").update({ moderation_status: "approved" }).eq("id", id);
      setFlagged((prev) => prev.filter((t) => t.id !== id));
    } else {
      await supabase.from("testimonies").delete().eq("id", id);
      setFlagged((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // ── Send push notification ────────────────────────────────────────────────
  const sendNotification = async () => {
    if (!notifForm.body.trim()) return;
    setNotifStatus("Sending…");
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifForm),
      });
      const json = await res.json();
      setNotifStatus(`✓ Sent to ${json.sent} subscribers (${json.failed ?? 0} failed)`);
    } catch {
      setNotifStatus("✗ Failed to send");
    }
  };

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    setAuthed(false);
    setStats(null);
    setUsers([]);
  };

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f0a] p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Nuru Admin</h1>
            <p className="text-white/50 text-sm mt-1">Restricted access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl bg-white/8 border border-white/12 px-4 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl bg-white/8 border border-white/12 px-4 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20"
            />
            {authError && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{authError}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-white/25 text-xs mt-6">
            Only authorised admin emails can access this panel.
            <br />Set <code className="text-white/40">NEXT_PUBLIC_ADMIN_EMAILS</code> in Vercel env.
          </p>
        </div>
      </div>
    );
  }

  // ── ADMIN DASHBOARD ───────────────────────────────────────────────────────
  const TABS = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users",    label: "Users",    icon: "👥" },
    { id: "content",  label: "Content",  icon: "📋" },
    { id: "push",     label: "Push",     icon: "🔔" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#080d08] text-white font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0d130d]/90 backdrop-blur border-b border-white/8">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <span className="font-bold text-sm">Nuru Admin</span>
          <span className="ml-2 rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-emerald-400 text-[10px] font-semibold uppercase tracking-wide">Live</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/en" className="text-white/40 hover:text-white text-xs transition-colors">← App</a>
          <button onClick={handleSignOut} className="text-white/40 hover:text-red-400 text-xs transition-colors">Sign out</button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex gap-1 px-4 pt-4 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white/10 text-white border border-b-0 border-white/12"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="p-4 space-y-4 border-t border-white/8">

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <>
            {!stats ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Stat icon="👤" label="Registered users" value={stats.users} color="bg-blue-500/15 border-blue-500/20 text-blue-100" />
                  <Stat icon="✨" label="Stories generated" value={stats.stories} color="bg-purple-500/15 border-purple-500/20 text-purple-100" />
                  <Stat icon="🙌" label="Testimonies" value={stats.testimonies} color="bg-emerald-500/15 border-emerald-500/20 text-emerald-100" />
                  <Stat icon="🙏" label="Prayers written" value={stats.prayers} color="bg-orange-500/15 border-orange-500/20 text-orange-100" />
                  <Stat icon="🔔" label="Push subscribers" value={stats.subscribers} color="bg-rose-500/15 border-rose-500/20 text-rose-100" />
                  <Stat icon="✅" label="Devotions completed" value={stats.completedDevotions} color="bg-teal-500/15 border-teal-500/20 text-teal-100" />
                </div>

                {/* Vercel Analytics embed note */}
                <Section title="Page Analytics — Vercel">
                  <p className="text-white/50 text-sm mb-3">
                    Full page-view data, unique visitors, and geographic breakdown are available in your Vercel dashboard.
                  </p>
                  <a
                    href="https://vercel.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 px-4 py-2 text-xs font-medium transition-colors"
                  >
                    Open Vercel Analytics →
                  </a>
                  <p className="mt-3 text-white/30 text-xs">
                    Vercel Analytics is active and tracking all page views automatically.
                  </p>
                </Section>
              </>
            )}
          </>
        )}

        {/* ── USERS TAB ────────────────────────────────────────────────────── */}
        {activeTab === "users" && (
          <Section title={`Registered Users (${users.length} shown)`}>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/40 border-b border-white/8">
                    <th className="text-left py-2 px-2 font-medium">Name</th>
                    <th className="text-left py-2 px-2 font-medium">Lang</th>
                    <th className="text-left py-2 px-2 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/4 transition-colors">
                      <td className="py-2 px-2 font-medium text-white/90 truncate max-w-[140px]">{u.display_name}</td>
                      <td className="py-2 px-2">
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${u.language === "sw" ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"}`}>
                          {u.language?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-white/40">
                        {new Date(u.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="text-white/30 text-sm text-center py-6">No users yet</p>}
            </div>
          </Section>
        )}

        {/* ── CONTENT TAB ──────────────────────────────────────────────────── */}
        {activeTab === "content" && (
          <div className="space-y-4">
            {/* Flagged */}
            <Section title={`Flagged Testimonies (${flagged.length})`}>
              {flagged.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-4">No flagged content 🎉</p>
              ) : (
                <div className="space-y-3">
                  {flagged.map((t) => (
                    <div key={t.id} className="rounded-lg bg-red-500/8 border border-red-500/15 p-3 space-y-2">
                      <p className="text-white/80 text-xs leading-relaxed line-clamp-3">{t.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/30 text-[10px]">
                          {t.is_anonymous ? "Anonymous" : "Named"} · {new Date(t.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => moderateTestimony(t.id, "approve")}
                            className="rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 px-2.5 py-1 text-emerald-400 text-[11px] font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => moderateTestimony(t.id, "delete")}
                            className="rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 px-2.5 py-1 text-red-400 text-[11px] font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Recent testimonies */}
            <Section title="Recent Testimonies">
              <div className="space-y-2">
                {recentTestimonies.map((t) => (
                  <div key={t.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${t.moderation_status === "approved" ? "bg-emerald-400" : t.moderation_status === "flagged" ? "bg-red-400" : "bg-yellow-400"}`} />
                    <p className="text-white/70 text-xs leading-relaxed flex-1 line-clamp-2">{t.content}</p>
                    <span className="text-white/25 text-[10px] flex-shrink-0">
                      {new Date(t.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                ))}
                {recentTestimonies.length === 0 && <p className="text-white/30 text-sm text-center py-4">No testimonies yet</p>}
              </div>
            </Section>
          </div>
        )}

        {/* ── PUSH NOTIFICATIONS TAB ───────────────────────────────────────── */}
        {activeTab === "push" && (
          <div className="space-y-4">

          {/* VAPID key status */}
          <Section title="VAPID Key Status">
            {!vapidStatus ? (
              <div className="h-8 animate-pulse bg-white/5 rounded-lg" />
            ) : (
              <div className="space-y-3">
                {/* Status badge */}
                {vapidStatus.configured ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-400 text-sm font-medium">VAPID key is valid ✓</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="text-red-400 text-base flex-shrink-0 mt-0.5">⚠️</span>
                    <div>
                      <p className="text-red-300 text-sm font-medium">VAPID key invalid or missing</p>
                      <p className="text-red-400/70 text-xs mt-1">{vapidStatus.error}</p>
                    </div>
                  </div>
                )}

                {/* Current key preview */}
                {vapidStatus.publicKey && (
                  <p className="text-white/30 text-xs font-mono break-all bg-white/4 rounded-lg px-3 py-2">
                    {vapidStatus.publicKey}
                  </p>
                )}

                {/* Generate button — always visible */}
                <div className="pt-1">
                  <p className="text-white/40 text-xs mb-2">
                    {vapidStatus.configured
                      ? "Need to rotate your keys? Generate a fresh pair below:"
                      : "Generate a new key pair and add them to your Vercel environment variables:"}
                  </p>
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/notifications/generate-vapid");
                      if (res.ok) setGeneratedKeys(await res.json());
                    }}
                    className="rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 px-4 py-2 text-xs font-medium transition-colors"
                  >
                    Generate new VAPID keys
                  </button>
                </div>

                {generatedKeys && (
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3 space-y-2 text-xs font-mono">
                    <p className="text-white/40 text-[10px] uppercase tracking-wide mb-1">
                      Copy these → Vercel Dashboard → Settings → Environment Variables → Redeploy
                    </p>
                    <div className="space-y-1">
                      <span className="text-emerald-400">VAPID_PUBLIC_KEY</span>
                      <p className="text-white/70 break-all bg-white/5 rounded px-2 py-1 select-all">{generatedKeys.publicKey}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-yellow-400">VAPID_PRIVATE_KEY</span>
                      <p className="text-white/70 break-all bg-white/5 rounded px-2 py-1 select-all">{generatedKeys.privateKey}</p>
                    </div>
                    <p className="text-white/30 text-[10px] pt-1 border-t border-white/8 mt-2">
                      ⚠️ Also set <span className="text-white/50">VAPID_CONTACT_EMAIL</span>=your@email.com
                      · After saving all three, redeploy the project.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Section>

          <Section title="Send Push Notification">
            <div className="space-y-3">
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Title</label>
                <input
                  type="text"
                  value={notifForm.title}
                  onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                  className="w-full rounded-lg bg-white/6 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/15"
                />
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Message body *</label>
                <textarea
                  value={notifForm.body}
                  onChange={(e) => setNotifForm({ ...notifForm, body: e.target.value })}
                  rows={3}
                  placeholder="Write your message here…"
                  className="w-full rounded-lg bg-white/6 border border-white/10 px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/25 resize-none"
                />
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Deep-link URL</label>
                <input
                  type="text"
                  value={notifForm.url}
                  onChange={(e) => setNotifForm({ ...notifForm, url: e.target.value })}
                  className="w-full rounded-lg bg-white/6 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-white/25"
                />
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wide mb-2">Preview</p>
                <div className="flex items-start gap-2">
                  <img src="/logos/light.png" alt="" className="w-8 h-8 rounded-lg flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-xs text-white">{notifForm.title || "Nuru"}</p>
                    <p className="text-white/60 text-xs mt-0.5">{notifForm.body || "Your message here…"}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={sendNotification}
                disabled={!notifForm.body.trim()}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                Send to all {stats?.subscribers ?? "?"} subscribers
              </button>

              {notifStatus && (
                <p className={`text-xs text-center rounded-lg px-3 py-2 ${notifStatus.startsWith("✓") ? "bg-emerald-500/10 text-emerald-400" : notifStatus.startsWith("✗") ? "bg-red-500/10 text-red-400" : "bg-white/5 text-white/50"}`}>
                  {notifStatus}
                </p>
              )}
            </div>
          </Section>
          </div>
        )}
      </main>
    </div>
  );
}
