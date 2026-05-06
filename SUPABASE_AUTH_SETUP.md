# Supabase Auth-setup för Fluentic AI

5-minuters setup för att aktivera riktig autentisering med email + lösenord.

## 1. Hämta env-vars från Supabase
1. Öppna ditt Supabase-projekt → **Settings** → **API**
2. Kopiera:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Kör schema-SQL
1. Supabase Dashboard → **SQL Editor** → **New query**
2. Klistra in hela innehållet i [`lib/supabase-schema.sql`](./lib/supabase-schema.sql)
3. Klicka **Run**

Detta skapar:
- `profiles`-tabell (id, email, name, tier, avatar_url, created_at, updated_at)
- Row Level Security-policies (varje user ser/uppdaterar bara sin egen rad)
- Trigger som auto-skapar profil vid signup

## 3. Sätt env-vars

### Lokalt (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://DITT-PROJEKT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GOOGLE_AI_API_KEY=<befintlig>
```

### Vercel
Settings → Environment Variables → lägg till samma 2 (för Production, Preview och Development).

## 4. Aktivera email-provider
Supabase Dashboard → **Authentication** → **Providers** → **Email**
- Default är "Email" på, "Confirm email" av — räcker för MVP
- Vill du kräva email-bekräftelse: slå på "Confirm email" och konfigurera SMTP

## 5. Testa
1. `npm run dev`
2. `/signup` — skapa ett konto
3. Verifiera i Supabase Dashboard → **Authentication** → **Users** att raden finns
4. Verifiera i **Database** → **Tables** → `profiles` att profil-raden auto-skapats

## Hur fungerar det?

Klient-koden i `lib/auth.ts` kör en check:
- Om `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` finns → **Supabase Auth** används
- Annars → **localStorage-mock** (för lokal dev utan Supabase)

Inga komponenter behöver ändras. `useUser()`-hook returnerar samma `User`-typ i båda lägena.

## När du är redo att deploya

1. Vercel env-vars satta ✅
2. SQL körd i Supabase ✅
3. Domain (eg. `fluentic.aiupscale.agency`) → Vercel → Settings → Domains
4. **Auth → URL Configuration**: lägg till din domain i "Site URL" + "Redirect URLs"
5. Push och deploy

## Felsökning
- **"Failed to fetch" vid signup** → check `NEXT_PUBLIC_SUPABASE_URL` är rätt format (ska sluta med `.supabase.co`)
- **"Invalid API key"** → använd `anon public` key, INTE `service_role`
- **Profil skapas inte** → SQL-trigger är kanske inte körd, kör schema.sql igen
- **RLS-fel "row violates policy"** → policies inte aktiverade, kör schema.sql igen

## Migration localStorage → Supabase
Om någon redan provat appen lokalt med localStorage-mock och vill bevara progress: ej automatisk migration än. Dom skapar konto på nytt — XP/streak/lessons är localStorage-baserade ändå.
