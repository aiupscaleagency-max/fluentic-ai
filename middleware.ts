// Access-gate: kräver en sha256-hashad cookie innan appen visas.
// Om FLUENTIC_ACCESS_CODE är osatt (lokal dev) är middlewaren en no-op.
import { NextResponse, type NextRequest } from "next/server";

// Web Crypto SHA-256 — fungerar i Edge runtime utan Node-krypto.
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req: NextRequest) {
  const code = process.env.FLUENTIC_ACCESS_CODE;
  // Lokal dev utan kod: släpp igenom direkt
  if (!code) return NextResponse.next();

  const cookie = req.cookies.get("fluentic_access")?.value;
  const expected = await sha256Hex(code);
  if (cookie === expected) return NextResponse.next();

  // Saknas/fel cookie: omdirigera till /unlock med callback till nuvarande path
  const url = req.nextUrl.clone();
  url.pathname = "/unlock";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Matcha allt UTOM unlock, unlock-API, statiska next-assets och favicon
  matcher: [
    "/((?!unlock|api/unlock|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
