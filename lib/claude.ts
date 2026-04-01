import Anthropic from "@anthropic-ai/sdk";
import type { Rarity } from "@/types/card";
import { clampHp, clampStat, normalizeRarity } from "@/lib/rarity";

export const CARD_SYSTEM_PROMPT = `You are the card designer for Legendex, a collector card game where everyone gets their own legendary nickname card. You create cards that feel personal, witty, and genuinely fun.

Rarity distribution (approximate): common 40%, rare 35%, epic 20%, legendary 5%.
legendary is rare — only assign it if the description is truly exceptional or the name has mythic energy.

Always respond with ONLY a raw JSON object. No markdown, no backticks, no explanation.`;

export function buildCardPrompt(name: string, description: string): string {
  return `
Name: ${name}
About: ${description || "No description — be creative based on the name alone."}

Generate their Legendex card as JSON:
{
  "nickname": "2-4 word legendary nickname that feels personal to them",
  "rarity": "common|rare|epic|legendary",
  "type": "3-8 word class/type descriptor (e.g. Freelance Design Wizard)",
  "hp": <number: common=40-80, rare=81-120, epic=121-160, legendary=161-200>,
  "ability_name": "3-5 word special ability name",
  "ability_desc": "One punchy sentence, max 12 words, what the ability does",
  "stats": {
    "power": <1-100, reflects their strength/impact>,
    "vibe": <1-100, reflects charisma/energy>,
    "chaos": <1-100, reflects unpredictability/wildness>
  },
  "flavor_text": "Short, ironic, poetic quote. Max 18 words. Should feel like it belongs on a real card.",
  "emoji": "One perfect emoji that represents them"
}`;
}

type ClaudeCardJson = {
  nickname?: string;
  rarity?: string;
  type?: string;
  hp?: number;
  ability_name?: string;
  ability_desc?: string;
  stats?: { power?: number; vibe?: number; chaos?: number };
  flavor_text?: string;
  emoji?: string;
};

export function stripJsonFences(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return t.trim();
}

export async function generateCardJson(
  name: string,
  description: string
): Promise<ClaudeCardJson> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  const model =
    process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929";

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    system: CARD_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildCardPrompt(name, description),
      },
    ],
  });

  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("No text response from model");
  }

  const raw = stripJsonFences(block.text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON from model");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid card payload");
  }

  return parsed as ClaudeCardJson;
}

export function claudeJsonToFields(
  name: string,
  j: ClaudeCardJson
): {
  nickname: string;
  rarity: Rarity;
  type: string;
  hp: number;
  ability_name: string;
  ability_desc: string;
  power: number;
  vibe: number;
  chaos: number;
  flavor_text: string;
  emoji: string;
} {
  const rarity = normalizeRarity(String(j.rarity ?? "common"));
  const hp = clampHp(rarity, Number(j.hp) || 50);
  const stats = j.stats ?? {};
  return {
    nickname: String(j.nickname ?? name).slice(0, 80),
    rarity,
    type: String(j.type ?? "Mystery Challenger").slice(0, 120),
    hp,
    ability_name: String(j.ability_name ?? "Wild Card").slice(0, 80),
    ability_desc: String(j.ability_desc ?? "Does something unforgettable.").slice(
      0,
      160
    ),
    power: clampStat(Number(stats.power) || 50),
    vibe: clampStat(Number(stats.vibe) || 50),
    chaos: clampStat(Number(stats.chaos) || 50),
    flavor_text: String(
      j.flavor_text ?? "Legends are written one choice at a time."
    ).slice(0, 200),
    emoji: (j.emoji ?? "✨").slice(0, 8),
  };
}
