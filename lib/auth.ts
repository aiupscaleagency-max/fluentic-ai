"use client";

// Auth-system för Fluentic.
//
// PRIMARY: Supabase Auth (email + password) när NEXT_PUBLIC_SUPABASE_URL och
// NEXT_PUBLIC_SUPABASE_ANON_KEY är satta. Profil + tier hämtas från
// "profiles"-tabellen (se lib/supabase-schema.sql).
//
// FALLBACK: localStorage-baserad mock så lokal dev fungerar utan Supabase.
// Samma User-typ + samma hooks så komponenter inte ser skillnad.
import * as React from "react";
import { getSupabaseBrowserClient, isSupabaseEnabled } from "./supabase";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  tier: "free" | "pro" | "family";
  avatar?: string;
}

interface StoredUser extends User {
  password: string;
}

// ============================================================
// LocalStorage-mock (fallback)
// ============================================================
const USERS_KEY = "fluentic.users";
const SESSION_KEY = "fluentic.session";

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}
function writeUsers(users: StoredUser[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch { /* quota */ }
}
function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("fluentic:auth-changed"));
}

// ============================================================
// Public API — auto-router till Supabase eller localStorage
// ============================================================

export interface AuthResult {
  user: User | null;
  error: string | null;
}

export async function signup(email: string, password: string, name: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { user: null, error: "Ogiltig e-postadress" };
  }
  if (password.length < 6) {
    return { user: null, error: "Lösenord måste vara minst 6 tecken" };
  }

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    // SUPABASE-PATH
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { name: name.trim() },
      },
    });
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: "Kunde inte skapa konto" };

    // Skapa profil-rad i public.profiles. RLS-policy låter user inserta sin egen.
    const profile: Omit<User, "id"> & { id: string } = {
      id: data.user.id,
      email: cleanEmail,
      name: name.trim() || cleanEmail.split("@")[0],
      createdAt: Date.now(),
      tier: "free",
    };
    await supabase.from("profiles").upsert({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      tier: profile.tier,
      created_at: new Date(profile.createdAt).toISOString(),
    });
    emit();
    return { user: profile, error: null };
  }

  // LOCALSTORAGE-FALLBACK
  if (typeof window === "undefined") return { user: null, error: "Server-only" };
  const users = readUsers();
  if (users.some((u) => u.email === cleanEmail)) {
    return { user: null, error: "E-post är redan registrerad" };
  }
  const newUser: StoredUser = {
    id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email: cleanEmail,
    name: name.trim() || cleanEmail.split("@")[0],
    createdAt: Date.now(),
    tier: "free",
    password,
  };
  writeUsers([...users, newUser]);
  window.localStorage.setItem(SESSION_KEY, newUser.id);
  emit();
  const { password: _pw, ...safe } = newUser;
  return { user: safe, error: null };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) return { user: null, error: "Fel e-post eller lösenord" };
    if (!data.user) return { user: null, error: "Inloggning misslyckades" };

    // Hämta profil
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    const user: User = {
      id: data.user.id,
      email: data.user.email ?? cleanEmail,
      name: profile?.name ?? data.user.user_metadata?.name ?? cleanEmail.split("@")[0],
      createdAt: profile?.created_at ? new Date(profile.created_at).getTime() : Date.now(),
      tier: (profile?.tier ?? "free") as User["tier"],
    };
    emit();
    return { user, error: null };
  }

  // FALLBACK
  if (typeof window === "undefined") return { user: null, error: "Server-only" };
  const users = readUsers();
  const user = users.find((u) => u.email === cleanEmail);
  if (!user || user.password !== password) {
    return { user: null, error: "Fel e-post eller lösenord" };
  }
  window.localStorage.setItem(SESSION_KEY, user.id);
  emit();
  const { password: _pw, ...safe } = user;
  return { user: safe, error: null };
}

export async function logout(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    await supabase.auth.signOut();
    emit();
    return;
  }
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  emit();
}

export async function getCurrentUserAsync(): Promise<User | null> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();
    return {
      id: data.user.id,
      email: data.user.email ?? "",
      name: profile?.name ?? data.user.user_metadata?.name ?? data.user.email?.split("@")[0] ?? "",
      createdAt: profile?.created_at ? new Date(profile.created_at).getTime() : Date.now(),
      tier: (profile?.tier ?? "free") as User["tier"],
    };
  }
  return getCurrentUserSync();
}

// Synkron variant — för komponenter som inte vill awaita.
// I Supabase-mode returneras null tills useUser-hooken hunnit hämta.
export function getCurrentUser(): User | null {
  return getCurrentUserSync();
}

function getCurrentUserSync(): User | null {
  if (typeof window === "undefined") return null;
  if (isSupabaseEnabled()) {
    // Supabase är async — använd useUser-hook istället. Returnera null som default.
    return null;
  }
  try {
    const sessionId = window.localStorage.getItem(SESSION_KEY);
    if (!sessionId) return null;
    const user = readUsers().find((u) => u.id === sessionId);
    if (!user) return null;
    const { password: _pw, ...safe } = user;
    return safe;
  } catch {
    return null;
  }
}

export async function updateUserTier(tier: User["tier"]): Promise<User | null> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    await supabase.from("profiles").update({ tier }).eq("id", auth.user.id);
    emit();
    return getCurrentUserAsync();
  }
  if (typeof window === "undefined") return null;
  const sessionId = window.localStorage.getItem(SESSION_KEY);
  if (!sessionId) return null;
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === sessionId);
  if (idx < 0) return null;
  users[idx].tier = tier;
  writeUsers(users);
  emit();
  const { password: _pw, ...safe } = users[idx];
  return safe;
}

// React-hook — fungerar både för Supabase och localStorage
export function useUser(): User | null {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const u = await getCurrentUserAsync();
      if (!cancelled) setUser(u);
    }
    refresh();

    function onChange() { void refresh(); }
    window.addEventListener("fluentic:auth-changed", onChange);

    // Supabase-listener för session-ändringar
    const supabase = getSupabaseBrowserClient();
    let unsub: (() => void) | undefined;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(() => { void refresh(); });
      unsub = () => data.subscription.unsubscribe();
    }

    return () => {
      cancelled = true;
      window.removeEventListener("fluentic:auth-changed", onChange);
      unsub?.();
    };
  }, []);

  return user;
}
