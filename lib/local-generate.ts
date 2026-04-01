import type { CardData, Rarity } from "@/types/card";
import { clampHp, clampStat } from "@/lib/rarity";

function newCardId(): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]!;
}

function rarityFromSeed(seed: number): Rarity {
  const roll = seed % 100;
  if (roll < 40) return "common";
  if (roll < 75) return "rare";
  if (roll < 95) return "epic";
  return "legendary";
}

function titleCase(s: string): string {
  return s
    .split(/\s+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

const ABILITIES = [
  ["Ship It Ritual", "Turns deadlines into trophies overnight."],
  ["Glitch Step", "Dodges problems by becoming the solution."],
  ["Aura Buffer", "Raises team morale by 30% instantly."],
  ["Pixel Perfect Strike", "One hit—everything snaps into alignment."],
  ["Scope Shield", "Negates one surprise request per day."],
  ["Chaos Bloom", "Makes the weird idea become the best idea."],
  ["Momentum Loop", "Once started, cannot be stopped."],
  ["Client Whisper", "Translates vague vibes into concrete wins."],
  ["Late-Night Forge", "Crafts excellence when the world sleeps."],
  ["Patch Notes", "Fixes reality with suspiciously small diffs."],
  ["Flow-State Lock", "Finds the clean line—then never loses it."],
  ["Horizon Dash", "Turns open space into forward motion."],
] as const;

function abilityIndexFromText(desc: string, fallback: number): number {
  const d = desc.toLowerCase();
  const rules: [RegExp, number][] = [
    [/ship|deploy|launch|release|prod|production/, 0],
    [/glitch|dodge|evade|pivot/, 1],
    [/morale|team|people|culture|lead/, 2],
    [/pixel|design|ui|figma|layout|brand|visual/, 3],
    [/scope|request|stakeholder|pm|deadline/, 4],
    [/weird|chaos|creative|wild|experiment/, 5],
    [/sprint|loop|iterate|velocity|momentum/, 6],
    [/client|customer|user|talk|communicate/, 7],
    [/night|late|sleep|3am|midnight|grind/, 8],
    [/bug|debug|fix|patch|broken|issue/, 9],
    // Map water/surf keywords to the *vibe* (flow/horizon), not literal sea imagery.
    [/ocean|sea|wave|surf|tide|beach|salt|coast/, 10],
  ];
  for (const [re, idx] of rules) {
    if (re.test(d)) return idx;
  }
  return fallback % ABILITIES.length;
}

function buildNickname(displayName: string, archetype: string): string {
  const base = `${displayName} · ${archetype}`;
  if (base.length <= 52) return base;
  const short = displayName.split(/\s+/)[0] ?? displayName;
  const alt = `${short} · ${archetype}`;
  if (alt.length <= 52) return alt;
  return alt.slice(0, 51).trimEnd() + "…";
}

type Theme = "ocean" | "default";

function themeFromText(desc: string): Theme {
  const d = desc.toLowerCase();
  if (/ocean|sea|wave|surf|tide|beach|salt|coast/.test(d)) return "ocean";
  return "default";
}

/** 0 = elegant / controlled, 100 = chaotic / wild — biases stats and flavor. */
export function generateLocalCard(
  name: string,
  description: string,
  styleChaos = 50
): CardData {
  const nameTrim = name.trim();
  const descTrim = description.trim();
  const t = Math.max(0, Math.min(100, styleChaos)) / 100;
  const seed =
    hashString(`${nameTrim}::${descTrim}::${Math.round(styleChaos)}`) || 1;
  const rarity = rarityFromSeed(seed + Math.floor(t * 37));

  const theme = themeFromText(descTrim);

  // Themes are *interpretive*. Even when triggered by literal words in the prompt,
  // we respond with metaphorical titles instead of repeating those words.
  const archetypes =
    theme === "ocean"
      ? [
          "Horizon Chaser",
          "Flow-State Vanguard",
          "Stormline Navigator",
          "Blue-Shift Nomad",
          "Open-Sky Raider",
          "Edge-of-World Ranger",
          "Pressureproof Runner",
          "Wildline Cartographer",
          "Calm-Under-Impact Duelist",
          "Far-From-Shore Strategist",
        ]
      : [
          "Night Shift Architect",
          "Velocity Alchemist",
          "Chaos Cartographer",
          "Pixel Paladin",
          "Vibe Conductor",
          "Midnight Operator",
          "Idea Blacksmith",
          "Lore Mechanic",
          "Neon Strategist",
          "Silk-Tongued Builder",
        ];

  const classes =
    theme === "ocean"
      ? [
          "Motion-Seeking Wanderer",
          "Impact-Ready Specialist",
          "Zen Under Pressure",
          "Line-Finding Pathfinder",
          "Adrenaline Cartographer",
          "Blue-Noise Tactician",
          "Momentum Artisan",
          "Open-World Duelist",
          "Edge Runner",
          "Flow Engineer",
        ]
      : [
          "Freelance Design Wizard",
          "Product Sorcerer",
          "Interface Ranger",
          "Full-Stack Trickster",
          "Brand Summoner",
          "Startup Whisperer",
          "Ops Bard",
          "Iteration Monk",
          "Debug Duelist",
          "Motion Artisan",
        ];

  const emojiPool =
    theme === "ocean"
      ? ["🌙", "🗡️", "✨", "🧿", "⚡️", "🧭", "🛰️", "🏁", "🫧", "🧩"]
      : ["✨", "⚡️", "🎨", "🛠️", "🧠", "🔥", "🧩", "🌙", "🗡️", "🧿"];

  const flavorOceanElegant = [
    "In another life, they ruled the horizon—now they move with quiet precision.",
    "Calm under impact. Every move measured.",
    "They read the line before they take it—no wasted motion.",
    "A steady hand when the world gets loud.",
    "Patience, timing, and a clean finish.",
    "Where others rush, they refine.",
    "Built for rhythm. Trained for restraint.",
    "They translate focus into forward momentum.",
    "Grace under pressure—no theatrics required.",
    "Elegance isn’t softness; it’s control.",
  ];
  const flavorOceanChaotic = [
    "In another life, they ruled the horizon—now they chase the cleanest line on instinct.",
    "Calm under impact. Fast when it counts.",
    "They don’t look for momentum—they manufacture it.",
    "A storm to outsiders, a compass to their crew.",
    "Patience, timing, and a fearless step forward.",
    "Every run is a new map—and they always find the way through.",
    "Where others see pressure, they see rhythm.",
    "Built for motion. Trained for chaos.",
    "They translate raw energy into forward progress.",
    "King energy—without the ego.",
  ];
  const flavorDefaultElegant = [
    "Precision first—then the flourish.",
    "They make the hard thing look effortless.",
    "A quiet signature on a loud world.",
    "Every choice deliberate. Every detail earned.",
    "Refined instincts. Unshakable timing.",
    "They don’t chase noise—they shape it.",
    "Calm confidence. Sharp execution.",
    "The room settles when they step in.",
    "Elegance is their discipline.",
    "They win by never needing to shout.",
  ];
  const flavorDefaultChaotic = [
    "Every pixel placed with intentional mischief.",
    "They ship first, explain later, and somehow it works.",
    "A calm smile. A chaotic commit history.",
    "Legends are written one iteration at a time.",
    "The vibe is immaculate. The plan is… flexible.",
    "All roads lead to a perfect deploy.",
    "Some call it luck. They call it practice.",
    "Reality bends around their roadmap.",
    "If you hear typing at 3am, it’s already too late.",
    "Built different. Debugged different.",
  ];

  const flavorPool =
    theme === "ocean"
      ? (seed % 100 < t * 100 ? flavorOceanChaotic : flavorOceanElegant)
      : seed % 100 < t * 100
        ? flavorDefaultChaotic
        : flavorDefaultElegant;

  const displayName = titleCase(nameTrim) || "Traveler";
  const archetype = pick(archetypes, seed + Math.floor(t * 41));
  const nickname = buildNickname(displayName, archetype);

  // Keep the subtitle flavorful, not a verbatim copy of the prompt.
  const typeLine = pick(classes, seed >>> 3);

  const abiIdx = abilityIndexFromText(
    descTrim,
    (seed >>> 5) + Math.floor(t * 13)
  );
  const [ability_name, ability_desc] = ABILITIES[abiIdx]!;

  const baseHp =
    rarity === "common"
      ? 55
      : rarity === "rare"
        ? 95
        : rarity === "epic"
          ? 140
          : 185;

  const hp = clampHp(rarity, baseHp + ((seed >>> 7) % 21) - 10);
  const power = clampStat(
    45 +
      ((seed >>> 9) % 61) +
      Math.round(t * 8) -
      Math.round((1 - t) * 5)
  );
  const vibe = clampStat(
    45 +
      ((seed >>> 12) % 61) +
      Math.round((1 - t) * 12) -
      Math.round(t * 6)
  );
  const chaos = clampStat(
    25 +
      ((seed >>> 15) % 76) +
      Math.round(t * 28) -
      Math.round((1 - t) * 8)
  );

  const emoji = pick(emojiPool, (seed >>> 18) + Math.floor(t * 7));

  // Never copy the user's input verbatim onto the card — keep it interpretive.
  const flavor_text = pick(flavorPool, seed >>> 20);

  return {
    id: newCardId(),
    name: nameTrim,
    nickname,
    rarity,
    type: typeLine,
    hp,
    ability_name,
    ability_desc,
    power,
    vibe,
    chaos,
    flavor_text,
    emoji,
  };
}
