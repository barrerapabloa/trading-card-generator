import { NextResponse } from "next/server";
import { buildPortraitPrompt } from "@/lib/image-prompt";
import { generateFluxSchnellDataUri } from "@/lib/cloudflare-ai";
import type { CardData } from "@/types/card";

export const maxDuration = 120;

function safeString(v: unknown, max: number): string {
  const s = typeof v === "string" ? v : "";
  return s.trim().slice(0, max);
}

export async function POST(req: Request) {
  if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
    return NextResponse.json(
      { error: "Cloudflare AI not configured" },
      { status: 501 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = (body ?? {}) as Partial<CardData>;
  const nickname = safeString(b.nickname, 80);
  const type = safeString(b.type, 120);
  const ability_name = safeString(b.ability_name, 80);

  const rarity =
    b.rarity === "common" ||
    b.rarity === "rare" ||
    b.rarity === "epic" ||
    b.rarity === "legendary"
      ? b.rarity
      : "common";

  if (!nickname || !type || !ability_name) {
    return NextResponse.json(
      { error: "Missing fields for portrait" },
      { status: 400 }
    );
  }

  const prompt = buildPortraitPrompt({
    id: "tmp",
    name: "tmp",
    hp: 1,
    power: 1,
    vibe: 1,
    chaos: 1,
    flavor_text: "tmp",
    emoji: "✨",
    ...b,
    nickname,
    type,
    ability_name,
    rarity,
  } as CardData);

  try {
    const art_url = await generateFluxSchnellDataUri({
      prompt,
      seed: Math.floor(Math.random() * 10_000_000),
      // Slightly more steps can reduce garbled “logo” text in the frame (still not guaranteed).
      steps: 6,
    });
    return NextResponse.json({ art_url });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Portrait gen failed:", message);
    return NextResponse.json(
      { error: "Portrait generation failed", detail: message },
      { status: 502 }
    );
  }
}

