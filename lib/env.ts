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

// Stripe — server-only secret för att skapa Checkout-sessioner.
export function getStripeSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY;
}

// Webhook-signing secret för att verifiera Stripe webhooks är legitima.
export function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET;
}

// Stripe Price-IDs för Pro och Family-tier (skapas i Stripe Dashboard).
export function getStripePriceIds() {
  return {
    pro: process.env.STRIPE_PRICE_PRO,
    family: process.env.STRIPE_PRICE_FAMILY,
  };
}

// Resend API-key för transaktionella mail (välkomst, kvitton, etc).
// Resend > SendGrid eftersom 3000 mail/månad gratis och cleanare API.
export function getResendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY;
}

// Server-only Supabase-nyckel för admin-operationer (skapa user-rad utan RLS).
export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}
