"use client";

import { create } from "zustand";
import { createBrowserClient, isSupabaseReady } from "@/lib/supabase-browser";

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  language: "en" | "sw";
  isGuest: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateLanguage: (lang: "en" | "sw") => void;
}



export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    if (!isSupabaseReady()) {
      set({ error: "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local" });
      throw new Error("Supabase not configured. Add your keys to .env.local");
    }

    set({ error: null });
    const supabase = createBrowserClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ error: error.message });
        throw error;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            displayName: profile?.display_name || email.split("@")[0],
            avatarUrl: profile?.avatar_url || null,
            language: profile?.language || "en",
            isGuest: false,
          },
          error: null,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      set({ error: msg });
      throw err;
    }
  },

  signUp: async (email: string, password: string, displayName: string) => {
    if (!isSupabaseReady()) {
      set({ error: "Supabase not configured. Set keys in .env.local" });
      throw new Error("Supabase not configured");
    }

    set({ error: null });
    const supabase = createBrowserClient();

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        set({ error: error.message });
        throw error;
      }

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          display_name: displayName,
          language: "en",
        });

        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            displayName,
            avatarUrl: null,
            language: "en",
            isGuest: false,
          },
          error: null,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign up failed";
      set({ error: msg });
      throw err;
    }
  },

  signInWithGoogle: async () => {
    if (!isSupabaseReady()) {
      set({ error: "Supabase not configured. Set keys in .env.local" });
      return;
    }
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  signInAsGuest: () => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    set({
      user: {
        id: guestId,
        email: "",
        displayName: "Guest",
        avatarUrl: null,
        language: "en",
        isGuest: true,
      },
      error: null,
    });
    localStorage.setItem("faithflow_guest", JSON.stringify({ id: guestId }));
  },

  signOut: async () => {
    if (isSupabaseReady()) {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
    }
    localStorage.removeItem("faithflow_guest");
    set({ user: null, error: null });
  },

  loadUser: async () => {
    set({ loading: true, error: null });

    if (!isSupabaseReady()) {
      // Check for guest
      const guestData = localStorage.getItem("faithflow_guest");
      if (guestData) {
        const guest = JSON.parse(guestData);
        set({
          user: {
            id: guest.id,
            email: "",
            displayName: "Guest",
            avatarUrl: null,
            language: "en",
            isGuest: true,
          },
          loading: false,
        });
      } else {
        set({ user: null, loading: false });
      }
      return;
    }

    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        set({
          user: {
            id: session.user.id,
            email: session.user.email!,
            displayName: profile?.display_name || session.user.email!.split("@")[0],
            avatarUrl: profile?.avatar_url || null,
            language: profile?.language || "en",
            isGuest: false,
          },
          loading: false,
        });
      } else {
        const guestData = localStorage.getItem("faithflow_guest");
        if (guestData) {
          const guest = JSON.parse(guestData);
          set({
            user: {
              id: guest.id,
              email: "",
              displayName: "Guest",
              avatarUrl: null,
              language: "en",
              isGuest: true,
            },
            loading: false,
          });
        } else {
          set({ user: null, loading: false });
        }
      }
    } catch {
      // Supabase connection failed - check for guest
      const guestData = localStorage.getItem("faithflow_guest");
      if (guestData) {
        const guest = JSON.parse(guestData);
        set({
          user: { id: guest.id, email: "", displayName: "Guest", avatarUrl: null, language: "en", isGuest: true },
          loading: false,
        });
      } else {
        set({ user: null, loading: false });
      }
    }
  },

  updateLanguage: (lang: "en" | "sw") => {
    const user = get().user;
    if (user) {
      set({ user: { ...user, language: lang } });
    }
  },
}));
