import {
  Player,
  PlayerStats,
  CARD,
  CARD_LINE,
  INK,
  INK_SOFT,
  SortKey,
} from "../types";
import { emptyStats } from "../utils";
import { ChevronUp, ChevronDown, Users } from "lucide-react";
import { useState } from "react";

export function PlayerStatsPanel({
  roster,
  playerStats,
  gameCount,
}: {
  roster: Player[];
  playerStats: Record<number, PlayerStats>;
  gameCount: number;
}) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(-1); // -1 = descending by default

  const statsOf = (id: number) => playerStats[id] ?? emptyStats();

  const winRateOf = (id: number): string => {
    const s = statsOf(id);
    const decided = s.wins + s.losses;
    if (decided === 0) return "—";
    return `${Math.round((s.wins / decided) * 100)}%`;
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === -1 ? 1 : -1));
    } else {
      setSortKey(key);
      setSortDir(-1);
    }
  };

  const sortedRoster = [...roster].sort((a, b) => {
    if (!sortKey) return a.name.localeCompare(b.name);
    const diff = statsOf(a.id)[sortKey] - statsOf(b.id)[sortKey];
    if (diff !== 0) return diff * sortDir;
    return a.name.localeCompare(b.name); // stable tiebreaker
  });

  const SortIcon = ({ active }: { active: boolean }) => {
    if (!active) return null;
    return sortDir === -1 ? (
      <ChevronDown size={12} className="inline ml-0.5" />
    ) : (
      <ChevronUp size={12} className="inline ml-0.5" />
    );
  };

  return (
    <div className="rounded-2xl p-4 h-fit" style={{ background: CARD }}>
      <div className="flex items-center justify-between mb-3">
        <span
          className="kq-display font-semibold flex items-center gap-1.5"
          style={{ color: INK }}
        >
          <Users size={16} /> Player Stats
        </span>
        <span
          className="kq-mono text-xs px-2 py-0.5 rounded-full"
          style={{ background: "#EFEBE0", color: INK_SOFT }}
        >
          Game {gameCount}
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ color: INK_SOFT }} className="text-left">
            <th className="font-medium pb-2">Name</th>
            <th
              className="font-medium pb-2 text-center"
              aria-sort={
                sortKey === "matches"
                  ? sortDir === -1
                    ? "descending"
                    : "ascending"
                  : "none"
              }
            >
              <button
                type="button"
                onClick={() => toggleSort("matches")}
                aria-label="Sort by matches"
                className="kq-btn select-none inline-flex items-center justify-center mx-auto"
                style={{ color: "inherit" }}
              >
                Matches
                <SortIcon active={sortKey === "matches"} />
              </button>
            </th>
            <th
              className="font-medium pb-2 text-center"
              aria-sort={
                sortKey === "wins"
                  ? sortDir === -1
                    ? "descending"
                    : "ascending"
                  : "none"
              }
            >
              <button
                type="button"
                onClick={() => toggleSort("wins")}
                aria-label="Sort by wins"
                className="kq-btn select-none inline-flex items-center justify-center mx-auto"
                style={{ color: "inherit" }}
              >
                W
                <SortIcon active={sortKey === "wins"} />
              </button>
            </th>
            <th
              className="font-medium pb-2 text-center"
              aria-sort={
                sortKey === "losses"
                  ? sortDir === -1
                    ? "descending"
                    : "ascending"
                  : "none"
              }
            >
              <button
                type="button"
                onClick={() => toggleSort("losses")}
                aria-label="Sort by losses"
                className="kq-btn select-none inline-flex items-center justify-center mx-auto"
                style={{ color: "inherit" }}
              >
                L
                <SortIcon active={sortKey === "losses"} />
              </button>
            </th>
            <th className="font-medium pb-2 text-center">W%</th>
            <th className="font-medium pb-2 text-right">Last Game</th>
          </tr>
        </thead>
        <tbody>
          {sortedRoster.map((p) => {
            const stats = statsOf(p.id);
            return (
              <tr key={p.id} style={{ borderTop: `1px solid ${CARD_LINE}` }}>
                <td className="py-1.5" style={{ color: INK }}>
                  {p.name}
                </td>
                <td
                  className="py-1.5 text-center kq-mono"
                  style={{ color: INK }}
                >
                  {stats.matches}
                </td>
                <td
                  className="py-1.5 text-center kq-mono"
                  style={{ color: "#1B8A4A" }}
                >
                  {stats.wins}
                </td>
                <td
                  className="py-1.5 text-center kq-mono"
                  style={{ color: "#B4483A" }}
                >
                  {stats.losses}
                </td>
                <td
                  className="py-1.5 text-center kq-mono"
                  style={{ color: INK }}
                >
                  {winRateOf(p.id)}
                </td>
                <td
                  className="py-1.5 text-right kq-mono"
                  style={{ color: INK_SOFT }}
                >
                  {stats.lastGame > 0 ? `#${stats.lastGame}` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
