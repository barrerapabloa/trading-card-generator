import type { Rarity } from "@/types/card";

export const RARITY_ORDER: Rarity[] = ["common", "rare", "epic", "legendary"];

export const RARITY_GRADIENT: Record<Rarity, string> = {
  common:
    "linear-gradient(135deg, #6b7280 0%, #9ca3af 40%, #4b5563 100%)",
  rare: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 45%, #1e3a8a 100%)",
  epic: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #5b21b6 100%)",
  legendary:
    "linear-gradient(135deg, #eab308 0%, #facc15 35%, #b45309 100%)",
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export function clampHp(rarity: Rarity, hp: number): number {
  const ranges: Record<Rarity, [number, number]> = {
    common: [40, 80],
    rare: [81, 120],
    epic: [121, 160],
    legendary: [161, 200],
  };
  const [min, max] = ranges[rarity];
  return Math.min(max, Math.max(min, Math.round(hp)));
}

export function clampStat(n: number): number {
  return Math.min(100, Math.max(1, Math.round(n)));
}

export function normalizeRarity(value: string): Rarity {
  const v = value?.toLowerCase?.() ?? "";
  if (v === "common" || v === "rare" || v === "epic" || v === "legendary") {
    return v;
  }
  return "common";
}
