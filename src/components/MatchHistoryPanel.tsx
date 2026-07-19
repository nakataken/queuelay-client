import { History } from "lucide-react";
import { MatchRecord, CARD, CARD_LINE, INK, INK_SOFT } from "../types";
import { fmtClock } from "../utils";

export function MatchHistoryPanel({
  matches,
  nameOf,
}: {
  matches: MatchRecord[];
  nameOf: (id: number) => string;
}) {
  const sorted = [...matches].sort((a, b) => b.gameNumber - a.gameNumber);

  return (
    <div className="rounded-2xl p-4" style={{ background: CARD }}>
      <div className="flex items-center justify-between mb-3">
        <span
          className="kq-display font-semibold flex items-center gap-1.5"
          style={{ color: INK }}
        >
          <History size={16} /> Matches
        </span>
        <span
          className="kq-mono text-xs px-2 py-0.5 rounded-full"
          style={{ background: "#EFEBE0", color: INK_SOFT }}
        >
          {matches.length}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: INK_SOFT }}>
          No games played yet. Once you send a group to a court, it'll show up
          here.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((m) => (
            <li
              key={m.gameNumber}
              className="rounded-lg p-3"
              style={{ border: `1px solid ${CARD_LINE}` }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="kq-mono text-xs font-semibold"
                  style={{ color: m.color.bg }}
                >
                  Game #{m.gameNumber} &middot; Court {m.courtIndex + 1}
                </span>
                <span className="text-xs kq-mono" style={{ color: INK_SOFT }}>
                  {m.finishedAt
                    ? fmtClock(m.finishedAt - m.startedAt)
                    : "In progress"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {m.playerIds.map((id) => (
                  <span
                    key={id}
                    className="text-xs px-2 py-0.5 rounded-lg font-medium"
                    style={{ background: m.color.soft, color: INK }}
                  >
                    {nameOf(id)}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
