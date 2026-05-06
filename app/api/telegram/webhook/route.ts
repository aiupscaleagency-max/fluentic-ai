// Telegram-bot för Fluentic-tolk. Tar emot meddelanden via webhook,
// auto-detekterar källspråk och översätter mellan sv/es/en/fr.
//
// Setup:
// 1. Skapa bot via @BotFather i Telegram → få token
// 2. Sätt TELEGRAM_BOT_TOKEN + TELEGRAM_WEBHOOK_SECRET i Vercel/.env.local
// 3. Registrera webhook:
//    curl -F "url=https://DIN-DOMAIN/api/telegram/webhook?secret=<SECRET>" \
//         https://api.telegram.org/bot<TOKEN>/setWebhook
//
// Användning i Telegram:
// - "/start" → välkomstmeddelande
// - "/sv hej" → tvinga svenska som källa, översätt till spanska som default
// - "/sv→es hola amigo" → tvinga sv från es
// - Ren text → auto-detect → översätt till motpartens senaste språk
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { MODEL } from "@/lib/llm";
import { getGoogleApiKey, getTelegramBotToken, getTelegramWebhookSecret } from "@/lib/env";

export const runtime = "nodejs";

interface TelegramMessage {
  message_id: number;
  from?: { id: number; username?: string; first_name?: string };
  chat: { id: number; type: string };
  text?: string;
  voice?: { file_id: string; duration: number };
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

const SUPPORTED = ["sv", "es", "en", "fr"] as const;
type Lang = typeof SUPPORTED[number];
const LANG_NAMES: Record<Lang, string> = {
  sv: "Swedish", es: "Spanish", en: "English", fr: "French",
};
const LANG_FLAGS: Record<Lang, string> = {
  sv: "🇸🇪", es: "🇪🇸", en: "🇬🇧", fr: "🇫🇷",
};

// Skicka meddelande tillbaka till Telegram
async function sendMessage(token: string, chatId: number, text: string, replyToMessageId?: number) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      reply_to_message_id: replyToMessageId,
    }),
  });
}

// Auto-översätt med Gemini. Returnerar { detectedLang, translations: { other-langs: text } }
interface TranslationResult {
  detectedLang: Lang;
  translations: Partial<Record<Lang, string>>;
}

async function translate(apiKey: string, text: string, forceFrom?: Lang, forceTo?: Lang): Promise<TranslationResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const targets = forceTo
    ? [forceTo]
    : SUPPORTED.filter((l) => l !== forceFrom);
  const targetList = targets.map((l) => `"${l}": "<${LANG_NAMES[l]} translation>"`).join(", ");

  const system = `You are a fast, natural translator. The user sends one short message. ${
    forceFrom
      ? `Source language is ${LANG_NAMES[forceFrom]} (${forceFrom}).`
      : `Auto-detect the source language from these: Swedish (sv), Spanish (es), English (en), French (fr).`
  }
Output STRICT JSON: {"detectedLang": "<sv|es|en|fr>", "translations": { ${targetList} }}
Use natural, conversational tone — how a real person would say it. No formal textbook phrasing.
Output JSON only — no markdown, no commentary.`;

  const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: system });
  const resp = await model.generateContent({
    contents: [{ role: "user", parts: [{ text }] }],
    generationConfig: {
      maxOutputTokens: 600,
      temperature: 0.3,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
    } as Record<string, unknown>,
  });

  const raw = (resp.response.text() ?? "").trim();
  let parsed: TranslationResult;
  try {
    parsed = JSON.parse(raw) as TranslationResult;
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Translator returned non-JSON");
    parsed = JSON.parse(m[0]) as TranslationResult;
  }
  return parsed;
}

// Per-chat senaste översättning ger oss riktning för "ren text"-meddelanden.
// In-memory map räcker för MVP — re-deploy nollställer det. Senare: KV-store.
const lastDirection = new Map<number, Lang>();

function parseCommand(text: string): { from?: Lang; to?: Lang; payload: string } {
  // Format: /sv hej → from=sv, to=auto
  // Format: /sv→es hola → from=sv, to=es
  // Format: /es-en hello → from=es, to=en
  const m = text.match(/^\/(sv|es|en|fr)(?:[→-](sv|es|en|fr))?\s+(.+)$/i);
  if (m) {
    return { from: m[1].toLowerCase() as Lang, to: m[2]?.toLowerCase() as Lang | undefined, payload: m[3].trim() };
  }
  return { payload: text };
}

export async function POST(req: Request) {
  // Verifiera secret-parameter — utan den nekar vi
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const expected = getTelegramWebhookSecret();
  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = getTelegramBotToken();
  const apiKey = getGoogleApiKey();
  if (!token || !apiKey) {
    return NextResponse.json({ ok: false, error: "Missing TELEGRAM_BOT_TOKEN or GOOGLE_AI_API_KEY" }, { status: 500 });
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const msg = update.message;
  if (!msg?.chat?.id) return NextResponse.json({ ok: true });
  const chatId = msg.chat.id;

  // Voice handling skuld — text räcker som MVP
  if (msg.voice && !msg.text) {
    await sendMessage(
      token,
      chatId,
      "🎙️ Röst-översättning kommer i nästa version. Skicka text så länge!",
      msg.message_id,
    );
    return NextResponse.json({ ok: true });
  }

  const text = msg.text?.trim();
  if (!text) return NextResponse.json({ ok: true });

  // /start → välkomst
  if (text === "/start" || text === "/help") {
    await sendMessage(
      token,
      chatId,
      `*Fluentic Tolk* 🌍\n\n` +
        `Skicka text på svenska, spanska, engelska eller franska — jag översätter automatiskt.\n\n` +
        `*Tvinga riktning:*\n` +
        `\`/sv hej\` → från svenska\n` +
        `\`/sv→es hola\` → från sv till es\n\n` +
        `*Språk:* 🇸🇪 sv · 🇪🇸 es · 🇬🇧 en · 🇫🇷 fr`,
    );
    return NextResponse.json({ ok: true });
  }

  const { from, to, payload } = parseCommand(text);

  try {
    const result = await translate(apiKey, payload, from, to);
    lastDirection.set(chatId, result.detectedLang);

    // Formatera svar med flagga + språkkod + text per översättning
    const lines: string[] = [];
    lines.push(`${LANG_FLAGS[result.detectedLang]} _${LANG_NAMES[result.detectedLang]}_: ${payload}`);
    for (const [lang, t] of Object.entries(result.translations)) {
      if (!t) continue;
      lines.push(`${LANG_FLAGS[lang as Lang]} *${lang.toUpperCase()}*: ${t}`);
    }
    await sendMessage(token, chatId, lines.join("\n"), msg.message_id);
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "Översättning misslyckades";
    await sendMessage(token, chatId, `⚠️ ${errMsg}`, msg.message_id);
  }

  return NextResponse.json({ ok: true });
}
