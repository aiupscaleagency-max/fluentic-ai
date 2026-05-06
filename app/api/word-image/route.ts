// Hämtar en visuell illustration för ett ord från Pexels (gratis, 200/h-tier).
// Cachat per query i /tmp så vi slipper hammra deras API.
//
// Setup: PEXELS_API_KEY i .env.local. Skaffa på https://www.pexels.com/api/
// Utan nyckeln returnerar vi bara { url: null } så UI:t fall-tillbaka till emoji.
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { tmpdir } from "os";
import { getPexelsApiKey } from "@/lib/env";

export const runtime = "nodejs";

interface PexelsResp {
  photos: Array<{
    src: { medium: string; small: string; tiny: string };
    alt?: string;
    photographer?: string;
  }>;
}

const CACHE_DIR = path.join(tmpdir(), "fluentic-word-image-cache");

async function readCache(key: string): Promise<{ url: string; alt: string; credit: string } | null> {
  try {
    const raw = await fs.readFile(path.join(CACHE_DIR, `${key}.json`), "utf-8");
    return JSON.parse(raw) as { url: string; alt: string; credit: string };
  } catch {
    return null;
  }
}
async function writeCache(key: string, data: { url: string; alt: string; credit: string }) {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(path.join(CACHE_DIR, `${key}.json`), JSON.stringify(data));
  } catch { /* ignorera */ }
}

function safeKey(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
}

export async function POST(req: Request) {
  let body: { query: string };
  try {
    body = (await req.json()) as { query: string };
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }
  const query = body?.query?.trim();
  if (!query) return NextResponse.json({ error: "query krävs" }, { status: 400 });

  const apiKey = getPexelsApiKey();
  if (!apiKey) {
    // Utan nyckel — returnera tom så UI faller tillbaka till emoji
    return NextResponse.json({ url: null });
  }

  const key = safeKey(query);
  const cached = await readCache(key);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=square`;
    const res = await fetch(url, { headers: { Authorization: apiKey } });
    if (!res.ok) {
      return NextResponse.json({ url: null, error: `Pexels ${res.status}` });
    }
    const data = (await res.json()) as PexelsResp;
    const photo = data.photos?.[0];
    if (!photo) return NextResponse.json({ url: null });
    const result = {
      url: photo.src.medium,
      alt: photo.alt ?? query,
      credit: photo.photographer ?? "Pexels",
    };
    await writeCache(key, result);
    return NextResponse.json({ ...result, cached: false });
  } catch (e) {
    return NextResponse.json({
      url: null,
      error: e instanceof Error ? e.message : "Pexels-fel",
    });
  }
}
