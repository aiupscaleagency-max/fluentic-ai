// POST /api/unlock — verifierar access-koden och sätter en cookie med sha256-hash av koden.
import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface Body {
  code?: string;
}

export async function POST(req: Request) {
  const expected = process.env.FLUENTIC_ACCESS_CODE;
  // Ingen kod konfigurerad: ingen access-gate, men säg till anroparen
  if (!expected) {
    return NextResponse.json({ ok: true, note: "Access-gate avstängd (FLUENTIC_ACCESS_CODE saknas)" });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  const code = body?.code?.trim();
  if (!code || code !== expected) {
    return NextResponse.json({ error: "Fel kod" }, { status: 401 });
  }

  const hash = await sha256Hex(expected);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("fluentic_access", hash, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dagar
  });
  return res;
}
