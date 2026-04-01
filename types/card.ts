export type Rarity = "common" | "rare" | "epic" | "legendary";

export type CardData = {
  id: string;
  name: string;
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
  art_url?: string;
};
