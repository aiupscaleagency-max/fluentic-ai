// Gemini TTS — naturliga röster för Hectór, Maritza, Adison och språkövningar.
// Använder gemini-2.5-flash-preview-tts via Google AI Studio (samma API-nyckel
// som chat). Cachas på server (/tmp) per text+voice för att minska kostnad och latens.
//
// Tillgängliga röster (prebuilt): Kore, Puck, Charon, Fenrir, Leda, Orus, Aoede,
// Callirrhoe, Autonoe, Enceladus, Iapetus, Umbriel, Algieba, Despina, Erinome,
// Algenib, Rasalgethi, Laomedeia, Achernar, Alnilam, Schedar, Gacrux, Pulcherrima,
// Achird, Zubenelgenubi, Vindemiatrix, Sadachbia, Sadaltager, Sulafat.
//
// Mappning: vi väljer röst-id i klient-koden (lib/tts.ts) baserat på persona/lang.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { tmpdir } from "os";
import { createHash } from "crypto";
import { getGoogleApiKey } from "@/lib/env";

export const runtime = "nodejs";

interface Body {
  text: string;
  voice?: string;          // Prebuilt voice name, default "Kore"
  // Valfri "stil-prompt" som blandas in före texten — Gemini TTS kan styras
  // med naturliga instruktioner ("Säg detta varmt och peppigt:")
  styleHint?: string;
}

const CACHE_DIR = path.join(tmpdir(), "fluentic-tts-cache");

function cacheKey(text: string, voice: string, styleHint: string): string {
  return createHash("sha1").update(`${voice}|${styleHint}|${text}`).digest("hex");
}

async function readCache(key: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(path.join(CACHE_DIR, `${key}.wav`));
  } catch {
    return null;
  }
}

async function writeCache(key: string, buf: Buffer): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(path.join(CACHE_DIR, `${key}.wav`), buf);
  } catch { /* ignorera */ }
}

// Gemini TTS returnerar 16-bit PCM @ 24kHz. För browser-uppspelning lindar vi
// in den i en WAV-header så att <audio>-element kan spela direkt.
function pcmToWav(pcm: Buffer, sampleRate = 24000): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcm.length;

  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcm.copy(buffer, 44);
  return buffer;
}

export async function POST(req: Request) {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Google API-nyckel saknas" }, { status: 500 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) return NextResponse.json({ error: "text krävs" }, { status: 400 });
  if (text.length > 1500) return NextResponse.json({ error: "text för lång (max 1500)" }, { status: 400 });

  const voice = body.voice ?? "Kore";
  const styleHint = body.styleHint ?? "";
  const key = cacheKey(text, voice, styleHint);

  // Cache-hit — spotta ut audio direkt
  const cached = await readCache(key);
  if (cached) {
    return new Response(cached as unknown as BodyInit, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Cache": "hit",
      },
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-tts",
    });

    const prompt = styleHint ? `${styleHint}\n${text}` : text;

    const resp = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      } as Record<string, unknown>,
    });

    // Plocka ut PCM-data från response
    const candidates = resp.response.candidates ?? [];
    const part = candidates[0]?.content?.parts?.[0];
    type AudioPart = { inlineData?: { data?: string; mimeType?: string } };
    const audioData = (part as AudioPart | undefined)?.inlineData?.data;
    if (!audioData) {
      return NextResponse.json({ error: "Ingen audio-data i svaret" }, { status: 500 });
    }

    const pcm = Buffer.from(audioData, "base64");
    const wav = pcmToWav(pcm);
    await writeCache(key, wav);

    return new Response(wav as unknown as BodyInit, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Cache": "miss",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "TTS-fel";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
