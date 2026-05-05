// Hämtar Google AI Studio-nyckeln. Stödjer flera namn så att Mike's befintliga
// .env-filer (GOOGLE_AI_API_KEY i ThyroidAI/Paperclip) återanvänds direkt.
export function getGoogleApiKey(): string | undefined {
  return (
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY
  );
}
