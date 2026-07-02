---
summary: Lär dig spanska, engelska, franska och arabiska — med AI-driven konversation, flashcards (spaced-repetition-light), uttalsträning, mini-spel
---

# Fluentic AI

Lär dig spanska, engelska, franska och arabiska — med AI-driven konversation, flashcards (spaced-repetition-light), uttalsträning, mini-spel och en inbyggd tolk.

Byggt på Next.js 15 (App Router), React 19, Tailwind CSS v4, TypeScript och Google Gemini 2.0 Flash (`gemini-2.0-flash-exp`).

## Komma igång

```bash
cp .env.example .env.local
# Lägg in din Google-nyckel i .env.local
npm install
npm run dev
```

Öppna http://localhost:3000.

### Miljövariabler

| Variabel | Krävs | Beskrivning |
| --- | --- | --- |
| `GOOGLE_AI_API_KEY` | Ja | Google AI Studio-nyckel. Hämtas på <https://aistudio.google.com/apikey>. Krävs för `/api/chat`, `/api/translate` och `/api/pronunciation`. Fallback-namn: `GOOGLE_API_KEY` eller `GEMINI_API_KEY`. |
| `FLUENTIC_ACCESS_CODE` | Nej | Lösenord för access-gate. Sätts på publik deploy så att bara personer med koden kommer in. **Lämnas tom i lokal dev = ingen access-gate aktiveras**. |

Om Google-nyckeln saknas returnerar API:erna `{ error: "Google API-nyckel saknas (sätt GOOGLE_AI_API_KEY)" }` med status 500 — UI visar felet.

### LLM-val + pris

Vi kör **Gemini 2.0 Flash** för att hålla rörlig kostnad nere. Per 1M tokens (Maj 2026):

- Input: ~$0.10
- Output: ~$0.40

Det är ungefär 10× billigare än Claude Sonnet 4.6 vid jämförbar kvalitet på es / en / fr / ar — vilket är de fyra språken Fluentic stödjer.

Modellen är låst till `gemini-2.0-flash-exp` i `lib/llm.ts`. Byt på en rad om du vill testa annan Gemini-version.

### Access-gate (lösenordsskydd)

På publik deploy: sätt `FLUENTIC_ACCESS_CODE` till en valfri sträng (dela med användarna).

- Middlewaren kollar cookien `fluentic_access` — om den saknas eller inte matchar SHA-256 av koden så omdirigeras alla rutter (utom `/unlock`) till `/unlock`.
- `/unlock` har en form, postar till `/api/unlock` som sätter cookien (httpOnly, sameSite=lax, secure i prod, 30 dagar).
- I lokal dev utan kod = no-op. Du behöver inte ange något.

## Funktioner

- **Hem (`/`)** — språkväljare och CTA till lärar-, tolk- och schema-läge.
- **Lärar-läge (`/learn/[lang]`)** — flikar för:
  - Flashcards med vänd-animation och SRS-light (kort du missar kommer tillbaka snabbare).
  - Konversation med AI-tutor (Gemini) som svarar på målspråket + svensk översättning under.
  - Lyssna & repetera (TTS + STT via Web Speech API, likhet via Levenshtein).
  - Mini-spel: Match (4×4) och Lucka (multiple choice).
  - 10 roll-spels-scenarier (café, flygplats, restaurang, apotek, hotell, småprat med kollega m.fl.).
  - Lärväg med 5 lektioner per språk — auto-markeras klar när du gjort flashcards + cloze + listen.
  - XP- och streak-räknare som persisteras i `localStorage`.
- **Tolk-läge (`/translate`)** — text + mic-input, talsyntes på output, Konversations-tolk där två personer turas om och appen översätter åt motparten.
- **Schema (`/schedule`)** — lägg in lektioner per språk, tid och veckodagar; aktivera Web Notifications-påminnelser; en `setInterval`-loop kollar varje minut om en lektion ska triggas.

## Datalagring

Allt klientläge (XP, streak, SRS, schema, lektion-progress) lever i `localStorage` via en abstraktion i `lib/storage.ts`. Det går att byta ut till t.ex. Supabase utan att röra UI-komponenterna.

## Språk och RTL

Stödda språk: spanska (`es`), engelska (`en`), franska (`fr`) och arabiska (`ar`). Arabisk text renderas med `dir="rtl"` där den visas. UI-strängar är på svenska (Mikes modersmål).

## Designval

- **Tailwind v4** används med ny `@import "tailwindcss";`-syntax och `@theme`-block i `app/globals.css`. Ingen `tailwind.config.js`.
- **shadcn-stilade komponenter** är handskrivna i `components/ui/` istället för att köra CLI:n — vi behåller minimal yta och full kontroll.
- **Web Speech API** används för STT och TTS. Stödet varierar mellan webbläsare (bäst i Chromium); vi degraderar tyst när det saknas.
- **Modell** låst till `gemini-2.0-flash-exp` för alla tre API-rutterna. JSON-responser (translate + pronunciation) använder Geminis native `responseMimeType: "application/json"`.
- **Ingen mock-fallback** för LLM-anropen — Mikes preferens är tydliga felmeddelanden hellre än tyst fejk.

## Mappstruktur

```
middleware.ts                    — access-gate (no-op om FLUENTIC_ACCESS_CODE saknas)
app/
  page.tsx, layout.tsx, globals.css
  unlock/page.tsx
  learn/[lang]/page.tsx
  learn/[lang]/call/page.tsx
  learn/[lang]/scenario/[id]/page.tsx
  translate/page.tsx
  schedule/page.tsx
  api/chat/route.ts
  api/translate/route.ts
  api/pronunciation/route.ts
  api/unlock/route.ts
components/
  nav.tsx, flashcards.tsx, conversation.tsx, listen-repeat.tsx
  voice-call.tsx, pronunciation.tsx, scenarios-tab.tsx
  lesson-path.tsx, level-picker.tsx, daily-goal.tsx, onboarding.tsx
  translator.tsx, scheduler.tsx, progress-bar.tsx
  games/match.tsx, games/cloze.tsx
  ui/ (button, card, input, tabs, dialog, badge, progress)
lib/
  languages.ts, vocab.ts, phrases.ts, storage.ts, similarity.ts, cn.ts
  llm.ts, level.ts, lessons.ts, scenarios.ts, speech.ts, use-level.ts
```
