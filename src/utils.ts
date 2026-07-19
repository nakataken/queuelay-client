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
  ids: number[],
  levelOf: (id: number) => PlayerLevel,
): { teamA: number[]; teamB: number[]; imbalance: number } {
  if (ids.length !== 4) {
    return { teamA: ids.slice(0, 2), teamB: ids.slice(2, 4), imbalance: 0 };
  }
  const [a, b, c, d] = ids;
  const pairings: [number[], number[]][] = [
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
  let best = pairings[0];
  let bestDiff = Infinity;
  for (const [teamA, teamB] of pairings) {
    const wA = teamA.reduce((s, id) => s + LEVEL_WEIGHT[levelOf(id)], 0);
    const wB = teamB.reduce((s, id) => s + LEVEL_WEIGHT[levelOf(id)], 0);
    const diff = Math.abs(wA - wB);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = [teamA, teamB];
    }
  }
  return { teamA: best[0], teamB: best[1], imbalance: bestDiff };
}

export function levelDiversity(
  ids: number[],
  levelOf: (id: number) => PlayerLevel,
): number {
  return new Set(ids.map((id) => levelOf(id))).size;
}
