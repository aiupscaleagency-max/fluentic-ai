// Supabase-klient för auth + databas. Aktiveras när NEXT_PUBLIC_SUPABASE_URL
// och NEXT_PUBLIC_SUPABASE_ANON_KEY finns. Annars är allt no-op och appen
// faller tillbaka till localStorage-mock-auth.
//
// Setup-flow för Mike:
// 1. Sätt env-vars i .env.local och Vercel
// 2. Kör SQL i lib/supabase-schema.sql mot din Supabase-instans
// 3. Aktivera "Email" provider i Supabase → Auth → Providers (default på)
// 4. Klart — login/signup-pages använder Supabase automatiskt
import { createBrowserClient } from "@supabase/ssr";

export function isSupabaseEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Klient-side singleton — bara skapad om env finns
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!isSupabaseEnabled()) return null;
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return browserClient;
}
