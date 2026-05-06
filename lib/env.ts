// Hämtar Google AI Studio-nyckeln. Stödjer flera namn så att Mike's befintliga
// .env-filer (GOOGLE_AI_API_KEY i ThyroidAI/Paperclip) återanvänds direkt.
export function getGoogleApiKey(): string | undefined {
  return (
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY
  );
}

// Telegram-bot-token från BotFather. Sätt i Vercel/.env.local.
export function getTelegramBotToken(): string | undefined {
  return process.env.TELEGRAM_BOT_TOKEN;
}

// Hemlig token som skickas i webhook-URL för att verifiera att inkommande
// requests verkligen kommer från Telegram. Sätt en lång slumpsträng.
export function getTelegramWebhookSecret(): string | undefined {
  return process.env.TELEGRAM_WEBHOOK_SECRET;
}

// Pexels API-nyckel för bild-stöd per ord. Gratis-tier räcker för MVP.
export function getPexelsApiKey(): string | undefined {
  return process.env.PEXELS_API_KEY;
}
