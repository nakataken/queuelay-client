export interface Player {
  id: number;
  name: string;
  level: PlayerLevel;
}

export interface CourtColor {
  name: string;
  bg: string;
  soft: string;
}

export interface ActiveCourt {
  ids: number[];
  color: CourtColor;
  startedAt: number;
}

export type Court = ActiveCourt | null;

export interface PlayerStats {
  matches: number;
  lastGame: number; // 0 = never played
}

export type PlayerLevel = "A" | "B" | "C";

export interface SeedPlayer {
  name: string;
  level: string;
}

export const LEVEL_LABEL: Record<PlayerLevel, string> = {
  A: "Advanced",
  B: "Intermediate",
  C: "Beginner",
};

export const LEVEL_COLOR: Record<PlayerLevel, string> = {
  A: "#FF4D8D",
  B: "#FFAA1D",
  C: "#1FA3C9",
};

export const LEVEL_CYCLE: Record<PlayerLevel, PlayerLevel> = {
  A: "B",
  B: "C",
  C: "A",
};

export const LEVEL_WEIGHT: Record<PlayerLevel, number> = { A: 3, B: 2, C: 1 };

// Kulay ("color") palette — each round of court assignment cycles through these,
// so the board visually fills with color the way an open-play session fills with people.
export const COURT_COLORS: CourtColor[] = [
  { name: "Papaya", bg: "#FF7A45", soft: "#FFE7DA" },
  { name: "Guava", bg: "#FF4D8D", soft: "#FFDCE9" },
  { name: "Ube", bg: "#7C5CFF", soft: "#E6E0FF" },
  { name: "Limon", bg: "#86B916", soft: "#E9F3C9" },
  { name: "Mango", bg: "#FFAA1D", soft: "#FFECC8" },
  { name: "Sky", bg: "#1FA3C9", soft: "#D6F0F7" },
];

export const INK = "#0E2A26";
export const INK_SOFT = "#4E6B65";
export const BG = "#0B3B3A";
export const CARD = "#FFFFFF";
export const CARD_LINE = "#DCEAE6";

export const SEED_ROSTER: SeedPlayer[] = [
  { name: "Acob", level: "B" },
  { name: "Bryan", level: "B" },
  { name: "Chad", level: "B" },
  { name: "Chacha", level: "B" },
  { name: "Clarissa", level: "B" },
  { name: "Dan", level: "B" },
  { name: "Irish", level: "B" },
  { name: "Jiemuel", level: "B" },
  { name: "Osong", level: "B" },
  { name: "Khaye", level: "B" },
  { name: "Ken", level: "B" },
  { name: "Kevin", level: "B" },
  { name: "Mac", level: "B" },
  { name: "Rose", level: "B" },
  { name: "Roy", level: "B" },
  { name: "Ryan", level: "B" },
  { name: "Sandee", level: "B" },
  { name: "Topher", level: "B" },
  { name: "Trixie", level: "B" },
].sort((a, b) => a.name.localeCompare(b.name));

export const STORAGE_KEY = "queuelay:v1";
