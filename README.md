# Fluentic AI

Lär dig spanska, engelska, franska och arabiska — med AI-driven konversation, flashcards (spaced-repetition-light), uttalsträning, mini-spel och en inbyggd tolk.

Byggt på Next.js 15 (App Router), React 19, Tailwind CSS v4, TypeScript och Anthropic Claude (`claude-sonnet-4-6`).

## Komma igång

```bash
cp .env.example .env.local
# Lägg in din Anthropic API-nyckel i .env.local
npm install
npm run dev
```

Öppna http://localhost:3000.

### Miljövariabler

| Variabel | Beskrivning |
| --- | --- |
| `ANTHROPIC_API_KEY` | Din Anthropic-nyckel. Krävs för `/api/chat` och `/api/translate`. |

Om nyckeln saknas returnerar API:erna `{ error: "ANTHROPIC_API_KEY saknas" }` med status 500 — UI visar felet.

## Funktioner

- **Hem (`/`)** — språkväljare och CTA till lärar-, tolk- och schema-läge.
- **Lärar-läge (`/learn/[lang]`)** — flikar för:
  - Flashcards med vänd-animation och SRS-light (kort du missar kommer tillbaka snabbare).
  - Konversation med AI-tutor (Claude) som svarar på målspråket + svensk översättning under.
  - Lyssna & repetera (TTS + STT via Web Speech API, likhet via Levenshtein).
  - Mini-spel: Match (4×4) och Lucka (multiple choice).
  - XP- och streak-räknare som persisteras i `localStorage`.
- **Tolk-läge (`/translate`)** — text + mic-input, talsyntes på output, Konversations-tolk där två personer turas om och appen översätter åt motparten.
- **Schema (`/schedule`)** — lägg in lektioner per språk, tid och veckodagar; aktivera Web Notifications-påminnelser; en `setInterval`-loop kollar varje minut om en lektion ska triggas.

## Datalagring

Allt klientläge (XP, streak, SRS, schema) lever i `localStorage` via en abstraktion i `lib/storage.ts`. Det går att byta ut till t.ex. Supabase utan att röra UI-komponenterna.

## Språk och RTL

Stödda språk: spanska (`es`), engelska (`en`), franska (`fr`) och arabiska (`ar`). Arabisk text renderas med `dir="rtl"` där den visas. UI-strängar är på svenska (Mikes modersmål).

## Designval

- **Tailwind v4** används med ny `@import "tailwindcss";`-syntax och `@theme`-block i `app/globals.css`. Ingen `tailwind.config.js`.
- **shadcn-stilade komponenter** är handskrivna i `components/ui/` istället för att köra CLI:n — vi behåller minimal yta och full kontroll.
- **Web Speech API** används för STT och TTS. Stödet varierar mellan webbläsare (bäst i Chromium); vi degraderar tyst när det saknas.
- **Modell** låst till `claude-sonnet-4-6` för båda API-rutterna.
- **Ingen mock-fallback** för LLM-anropen — Mikes preferens är tydliga felmeddelanden hellre än tyst fejk.

## Deploy till Vercel

1. Pusha repot till GitHub.
2. Importera projektet på vercel.com.
3. Lägg till miljövariabel `ANTHROPIC_API_KEY` i Vercel.
4. Deploy.

## Mappstruktur

```
app/
  page.tsx, layout.tsx, globals.css
  learn/[lang]/page.tsx
  translate/page.tsx
  schedule/page.tsx
  api/chat/route.ts
  api/translate/route.ts
components/
  nav.tsx, flashcards.tsx, conversation.tsx, listen-repeat.tsx
  translator.tsx, scheduler.tsx, progress-bar.tsx
  games/match.tsx, games/cloze.tsx
  ui/ (button, card, input, tabs, dialog, badge, progress)
lib/
  languages.ts, vocab.ts, phrases.ts, storage.ts, similarity.ts, cn.ts
```
