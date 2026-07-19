import { Users } from "lucide-react";
import { Player, PlayerStats, CARD, CARD_LINE, INK, INK_SOFT } from "../types";

export function PlayerStatsPanel({
  roster,
  playerStats,
  gameCount,
}: {
  roster: Player[];
  playerStats: Record<number, PlayerStats>;
  gameCount: number;
}) {
  return (
    <div className="rounded-2xl p-4 h-fit mt-5" style={{ background: CARD }}>
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
            <th className="font-medium pb-2 text-center">Matches</th>
            <th className="font-medium pb-2 text-right">Last Game</th>
          </tr>
        </thead>
        <tbody>
          {[...roster]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((p) => {
              const stats = playerStats[p.id] ?? { matches: 0, lastGame: 0 };
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
