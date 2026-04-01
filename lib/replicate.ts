import Replicate from "replicate";
import type { CardData } from "@/types/card";

const RARITY_PROMPTS: Record<CardData["rarity"], string> = {
  common: "soft natural lighting, muted tones, simple background",
  rare: "dramatic blue electric lighting, dynamic pose, cinematic",
  epic: "purple void nebula background, glowing energy, epic fantasy portrait",
  legendary:
    "golden god rays, fire and smoke, mythic deity, ultra-detailed",
};

const STYLE_SUFFIX =
  "trading card game illustration, TCG art style, digital painting, highly detailed, 8k, centered composition, square format";

export function buildImagePrompt(card: CardData): string {
  const rarityMood = RARITY_PROMPTS[card.rarity];
  return `${card.nickname}, ${card.type}, ${card.ability_name}, ${rarityMood}, ${STYLE_SUFFIX}`;
}

function outputToUrl(output: unknown): string | undefined {
  if (typeof output === "string" && output.startsWith("http")) {
    return output;
  }
  if (Array.isArray(output) && output.length > 0) {
    const first = output[0] as unknown;
    if (typeof first === "string" && first.startsWith("http")) {
      return first;
    }
    if (first && typeof first === "object" && "url" in first) {
      const fn = (first as { url?: () => string }).url;
      if (typeof fn === "function") {
        const u = fn();
        if (typeof u === "string") return u;
      }
    }
  }
  return undefined;
}

export async function generatePortraitUrl(prompt: string): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("Missing REPLICATE_API_TOKEN");
  }

  const replicate = new Replicate({ auth: token });

  const output = await replicate.run("black-forest-labs/flux-schnell", {
    input: {
      prompt,
      aspect_ratio: "1:1",
      output_format: "png",
      num_outputs: 1,
    },
  });

  const url = outputToUrl(output);
  if (!url) {
    throw new Error("No image URL from Replicate");
  }
  return url;
}
