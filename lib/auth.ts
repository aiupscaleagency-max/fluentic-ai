"use client";

// Auth-system för Fluentic. Lokal localStorage-baserad mock för MVP — när vi
// senare kopplar Supabase ersätts denna fil med Supabase Auth-helpers utan
// att övriga komponenter behöver ändras (samma User-typ + samma hooks).
//
// Säkerhet: detta är INTE produktionssäkert. Lösenord hashas inte, ingen rate-
// limit, ingen email-verifiering. För familjen + tidiga betas räcker det. När
// betalning aktiveras → byt till Supabase Auth.
import * as React from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  // Medlemskaps-tier — för pricing-page. "free" är default.
  tier: "free" | "pro" | "family";
  // Avatar-URL eller initialer fallback
  avatar?: string;
}

const USERS_KEY = "fluentic.users";          // alla registrerade
const SESSION_KEY = "fluentic.session";      // current logged-in user-id

interface StoredUser extends User {
  // Plain-text för MVP. Ersätts vid Supabase-migration.
  password: string;
}

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

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const sessionId = window.localStorage.getItem(SESSION_KEY);
    if (!sessionId) return null;
    const user = readUsers().find((u) => u.id === sessionId);
    if (!user) return null;
    // Plocka bort password innan vi returnerar
    const { password: _pw, ...safe } = user;
    return safe;
  } catch {
    return null;
  }
}

export interface SignupResult {
  user: User | null;
  error: string | null;
}

export function signup(email: string, password: string, name: string): SignupResult {
  if (typeof window === "undefined") return { user: null, error: "Server-only" };
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { user: null, error: "Ogiltig e-postadress" };
  }
  if (password.length < 6) {
    return { user: null, error: "Lösenord måste vara minst 6 tecken" };
  }
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

export function login(email: string, password: string): SignupResult {
  if (typeof window === "undefined") return { user: null, error: "Server-only" };
  const cleanEmail = email.trim().toLowerCase();
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

export function logout(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  emit();
}

export function updateUserTier(tier: User["tier"]): User | null {
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

// React-hook
export function useUser(): User | null {
  const [user, setUser] = React.useState<User | null>(null);
  React.useEffect(() => {
    setUser(getCurrentUser());
    function onChange() { setUser(getCurrentUser()); }
    window.addEventListener("fluentic:auth-changed", onChange);
    return () => window.removeEventListener("fluentic:auth-changed", onChange);
  }, []);
  return user;
}
