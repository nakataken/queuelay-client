import { PlayerLevel, LEVEL_WEIGHT, STORAGE_KEY, MatchMode } from "./types";

export function fmtClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map((c) => [first, ...c]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

export function levelSpread(
  ids: number[],
  levelOf: (id: number) => PlayerLevel,
): number {
  const weights = ids.map((id) => LEVEL_WEIGHT[levelOf(id)]);
  return Math.max(...weights) - Math.min(...weights);
}

export function loadSaved(): any {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function bestTeamSplit(
  group: number[],
  levelOf: (id: number) => PlayerLevel,
  mode: MatchMode,
  resultOf: (id: number) => "W" | "L" | null,
): { teamA: number[]; teamB: number[]; score: number } {
  if (group.length !== 4) {
    return { teamA: group.slice(0, 2), teamB: group.slice(2, 4), score: 0 };
  }
  const [a, b, c, d] = group;
  const splits: [number[], number[]][] = [
    [
      [a, b],
      [c, d],
    ],
    [
      [a, c],
      [b, d],
    ],
    [
      [a, d],
      [b, c],
    ],
  ];

  const scoreOf = ([teamA, teamB]: [number[], number[]]): number => {
    if (mode === "winloss") {
      // Prefer each team to have one previous winner + one previous loser.
      const mixed = (team: number[]) => {
        const r = team.map(resultOf);
        return r.includes("W") && r.includes("L") ? 1 : 0;
      };
      return mixed(teamA) + mixed(teamB);
    }
    // "mixed" and "competitive" both want the two teams' total level as close as possible —
    // the difference between them is which 4 players get selected in the first place (see groupScore).
    const sumA = teamA.reduce((s, id) => s + LEVEL_WEIGHT[levelOf(id)], 0);
    const sumB = teamB.reduce((s, id) => s + LEVEL_WEIGHT[levelOf(id)], 0);
    return -Math.abs(sumA - sumB);
  };

  let best = splits[0];
  let bestScore = -Infinity;
  for (const split of splits) {
    const s = scoreOf(split);
    if (s > bestScore) {
      bestScore = s;
      best = split;
    }
  }
  return { teamA: best[0], teamB: best[1], score: bestScore };
}

export function groupScore(
  group: number[],
  levelOf: (id: number) => PlayerLevel,
  mode: MatchMode,
  resultOf: (id: number) => "W" | "L" | null,
): number {
  if (mode === "competitive") {
    // Fewer distinct levels in the group = closer to "A&A vs A&A". Falls back gracefully
    // to whatever's closest when a perfectly uniform group of 4 isn't available.
    return -new Set(group.map((id) => levelOf(id))).size;
  }
  if (mode === "winloss") {
    const wins = group.filter((id) => resultOf(id) === "W").length;
    const losses = group.filter((id) => resultOf(id) === "L").length;
    return -Math.abs(wins - losses); // prefer an even 2/2 winner/loser split
  }
  // mixed: prefer variety across the group (current default behavior)
  return new Set(group.map((id) => levelOf(id))).size;
}
