// Resend välkomst-mail vid signup. Anropas från klient efter lyckad signup.
// Tyst no-op om RESEND_API_KEY saknas (lokalt eller innan setup).
//
// Setup:
// 1. resend.com → skapa konto → få API-nyckel (gratis 3000/månad)
// 2. Verifiera din domain (eller använd resend.dev till testet)
// 3. RESEND_API_KEY i Vercel-env
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getResendApiKey } from "@/lib/env";

export const runtime = "nodejs";

interface Body {
  to: string;
  name: string;
  uiLang?: "sv" | "es" | "en";
}

const SUBJECT: Record<"sv" | "es" | "en", string> = {
  sv: "Välkommen till Fluentic AI!",
  es: "¡Bienvenido a Fluentic AI!",
  en: "Welcome to Fluentic AI!",
};

function welcomeHtml(name: string, lang: "sv" | "es" | "en"): string {
  const greeting: Record<"sv" | "es" | "en", string> = {
    sv: `Hej ${name}!`,
    es: `¡Hola ${name}!`,
    en: `Hi ${name}!`,
  };
  const body: Record<"sv" | "es" | "en", { p1: string; p2: string; p3: string; cta: string }> = {
    sv: {
      p1: "Välkommen till Fluentic AI! Du har precis börjat din språkresa.",
      p2: "Möt dina tre AI-lärare: <b>Hectór</b> (huvudlärare för röstsamtal), <b>Maritza</b> (snabb stödlärare) och <b>Adison</b> (live-tolk).",
      p3: "5 minuter om dagen räcker för att bygga flytande språk. Kom igång med din första lektion när du är redo.",
      cta: "Öppna Fluentic →",
    },
    es: {
      p1: "Bienvenido a Fluentic AI. Acabas de empezar tu viaje lingüístico.",
      p2: "Conoce a tus tres profesores IA: <b>Hectór</b> (profesor principal para llamadas de voz), <b>Maritza</b> (apoyo rápido) y <b>Adison</b> (intérprete en vivo).",
      p3: "Bastan 5 minutos al día para construir fluidez. Empieza tu primera lección cuando estés listo.",
      cta: "Abrir Fluentic →",
    },
    en: {
      p1: "Welcome to Fluentic AI. You've just started your language journey.",
      p2: "Meet your three AI teachers: <b>Hectór</b> (main teacher for voice calls), <b>Maritza</b> (quick-help) and <b>Adison</b> (live interpreter).",
      p3: "5 minutes a day is enough to build fluency. Start your first lesson when you're ready.",
      cta: "Open Fluentic →",
    },
  };
  const t = body[lang];
  return `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0b0918;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0918;padding:40px 20px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:24px;overflow:hidden;">
        <tr><td style="padding:32px 32px 0 32px;text-align:center;">
          <div style="display:inline-block;width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#8b5cf6,#22d3ee);line-height:64px;text-align:center;font-size:32px;">✨</div>
        </td></tr>
        <tr><td style="padding:24px 32px;color:#f1f5f9;">
          <h1 style="margin:0 0 16px 0;font-size:28px;font-weight:800;color:#f1f5f9;">${greeting[lang]}</h1>
          <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#cbd5e1;">${t.p1}</p>
          <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#cbd5e1;">${t.p2}</p>
          <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#cbd5e1;">${t.p3}</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="https://fluentic.aiupscale.agency"
               style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#22d3ee);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px;">
              ${t.cta}
            </a>
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px 24px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
          <p style="margin:0;font-size:11px;color:#64748b;">© ${new Date().getFullYear()} Fluentic AI · fluentic.aiupscale.agency</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function POST(req: Request) {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    // Tyst no-op när Resend inte konfigurerat — signup ska INTE failas pga email
    return NextResponse.json({ skipped: true, reason: "RESEND_API_KEY ej satt" });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  if (!body.to || !body.name) {
    return NextResponse.json({ error: "to + name krävs" }, { status: 400 });
  }

  const lang = (body.uiLang ?? "sv") as "sv" | "es" | "en";

  try {
    const resend = new Resend(apiKey);
    // Använd "onboarding@resend.dev" tills domain verified — sen byts till
    // hello@fluentic.aiupscale.agency (kräver MX-record + verifiering i Resend)
    const from = process.env.RESEND_FROM ?? "Fluentic AI <onboarding@resend.dev>";
    const { data, error } = await resend.emails.send({
      from,
      to: body.to,
      subject: SUBJECT[lang],
      html: welcomeHtml(body.name, lang),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data?.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Email-fel";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
