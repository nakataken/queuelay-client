import { PlayerLevel, LEVEL_WEIGHT, STORAGE_KEY } from "./types";

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
): { teamA: number[]; teamB: number[]; imbalance: number } {
  if (group.length !== 4) {
    return { teamA: group.slice(0, 2), teamB: group.slice(2, 4), imbalance: 0 };
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
  let best = splits[0];
  let bestImbalance = Infinity;
  for (const [teamA, teamB] of splits) {
    const sumA = teamA.reduce((s, id) => s + LEVEL_WEIGHT[levelOf(id)], 0);
    const sumB = teamB.reduce((s, id) => s + LEVEL_WEIGHT[levelOf(id)], 0);
    const imbalance = Math.abs(sumA - sumB);
    if (imbalance < bestImbalance) {
      bestImbalance = imbalance;
      best = [teamA, teamB];
    }
  }
  return { teamA: best[0], teamB: best[1], imbalance: bestImbalance };
}

export function levelDiversity(
  group: number[],
  levelOf: (id: number) => PlayerLevel,
): number {
  return new Set(group.map((id) => levelOf(id))).size;
}
