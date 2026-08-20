export type CardSkin = "gold" | "platinum" | "onyx" | "sapphire" | "rose-gold";

export const CARD_SKIN_VALUES: CardSkin[] = [
  "gold",
  "platinum",
  "onyx",
  "sapphire",
  "rose-gold",
];

type SkinDef = {
  label: string;
  gradient: string;
  textClass: string;
  badgeClass: string;
};

const LIGHT_TEXT = "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]";

export const CARD_SKINS: Record<CardSkin, SkinDef> = {
  gold: {
    label: "Gold",
    gradient: "linear-gradient(135deg, #d9b13d 0%, #f5df9b 45%, #96721a 100%)",
    textClass: LIGHT_TEXT,
    badgeClass: "bg-white/15",
  },
  platinum: {
    label: "Platinum",
    gradient: "linear-gradient(135deg, #dfe3e8 0%, #f7f8fa 45%, #aeb4bd 100%)",
    textClass: "text-neutral-900",
    badgeClass: "bg-black/10",
  },
  onyx: {
    label: "Onyx",
    gradient: "linear-gradient(135deg, #3a3a3a 0%, #232323 45%, #000000 100%)",
    textClass: LIGHT_TEXT,
    badgeClass: "bg-white/15",
  },
  sapphire: {
    label: "Sapphire",
    gradient: "linear-gradient(135deg, #2c5aa0 0%, #4a7fc9 45%, #0f2f5c 100%)",
    textClass: LIGHT_TEXT,
    badgeClass: "bg-white/15",
  },
  "rose-gold": {
    label: "Rose Gold",
    gradient: "linear-gradient(135deg, #d9a08a 0%, #f0c9b8 45%, #a86450 100%)",
    textClass: LIGHT_TEXT,
    badgeClass: "bg-white/15",
  },
};
