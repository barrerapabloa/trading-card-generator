import type { CardData } from "@/types/card";

const RARITY_PROMPTS: Record<CardData["rarity"], string> = {
  common: "soft natural lighting, muted tones, simple background",
  rare: "dramatic blue electric lighting, dynamic pose, cinematic",
  epic: "purple void nebula background, glowing energy, epic fantasy portrait",
  legendary: "golden god rays, fire and smoke, mythic deity, ultra-detailed",
};

const STYLE_SUFFIX =
  "trading card game illustration, TCG art style, digital painting, highly detailed, centered composition, portrait, square format";

const NO_ARTIFACTS =
  "no text, no letters, no words, no watermark, no logos, no signatures, no typography, no captions, clean image only";

export function buildPortraitPrompt(card: CardData): string {
  const rarityMood = RARITY_PROMPTS[card.rarity];
  const who = card.name?.trim()
    ? `hero portrait inspired by this person: ${card.name.trim()}`
    : "fantasy hero portrait";
  return `${who}, ${card.nickname}, ${card.type}, mood: ${card.ability_name}, ${rarityMood}, ${STYLE_SUFFIX}, ${NO_ARTIFACTS}`;
}

