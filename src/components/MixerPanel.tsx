import { CalendarRange, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  MixerRound,
  CARD,
  CARD_LINE,
  INK,
  INK_SOFT,
  MixerGame,
} from "../types";

export function MixerPanel({
  schedule,
  nameOf,
  onAssignGame,
  onGenerate,
  openCourtExists,
  canGenerate,
  stale,
  playingIds,
  playedGames,
}: {
  schedule: MixerRound[];
  nameOf: (id: number) => string;
  onAssignGame: (
    gameId: string,
    teamA: [number, number],
    teamB: [number, number],
  ) => void;
  onGenerate: () => void;
  openCourtExists: boolean;
  canGenerate: boolean;
  stale: boolean;
  playingIds: Set<number>;
  playedGames: Set<string>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const gameIsPlaying = (g: MixerGame) =>
    [...g.teamA, ...g.teamB].some((id) => playingIds.has(id));

  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: CARD }}>
      {/* Collapse toggle header */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        className="w-full flex items-center justify-between mb-3"
      >
        <span
          className="kq-display font-semibold flex items-center gap-1.5"
          style={{ color: INK }}
        >
          <CalendarRange size={16} /> Mixer Schedule
        </span>
        <span className="flex items-center gap-2">
          <span
            className="kq-mono text-xs px-2 py-0.5 rounded-full"
            style={{ background: "#EFEBE0", color: INK_SOFT }}
          >
            {schedule.length} round{schedule.length === 1 ? "" : "s"}
          </span>
          {collapsed ? (
            <ChevronDown size={16} style={{ color: INK_SOFT }} />
          ) : (
            <ChevronUp size={16} style={{ color: INK_SOFT }} />
          )}
        </span>
      </button>

      {/* Generate/Regenerate — always visible (Option A) */}
      <div className="flex items-center justify-end mb-3">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="kq-btn text-xs font-semibold px-2 py-1 rounded-full disabled:opacity-40"
          style={{ background: "#FFAA1D", color: "#0E2A26" }}
          title="Build the round-robin schedule from the current Waiting queue"
        >
          {schedule.length > 0 ? "Regenerate" : "Generate"}
        </button>
      </div>

      {/* Collapsible body */}
      {!collapsed && (
        <>
          {stale && schedule.length > 0 && (
            <p className="text-[11px] mb-2 px-1" style={{ color: "#B4483A" }}>
              The Waiting players have changed since this schedule was built.
              Press Regenerate to update it.
            </p>
          )}

          {schedule.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: INK_SOFT }}>
              {canGenerate
                ? "Press Generate to build the round-robin schedule from the Waiting queue."
                : "Add at least 4 players to the Waiting queue to generate a Mixer schedule."}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {schedule.map((round) => (
                <li
                  key={round.roundNumber}
                  className="rounded-xl p-3"
                  style={{ border: `1px solid ${CARD_LINE}` }}
                >
                  <div
                    className="text-xs font-semibold mb-2"
                    style={{ color: INK_SOFT }}
                  >
                    Round {round.roundNumber}
                  </div>
                  <div className="flex flex-col gap-2">
                    {round.games.map((g) => {
                      const done = playedGames.has(g.id);
                      const onCourt =
                        !done &&
                        [...g.teamA, ...g.teamB].some((id) =>
                          playingIds.has(id),
                        );
                      return (
                        <div
                          key={g.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span
                            className="text-xs sm:text-sm"
                            style={{
                              color: done ? INK_SOFT : INK,
                              opacity: done ? 0.6 : 1,
                            }}
                          >
                            {nameOf(g.teamA[0])} & {nameOf(g.teamA[1])}
                            <span
                              className="kq-mono font-bold px-1.5"
                              style={{ color: INK_SOFT }}
                            >
                              vs
                            </span>
                            {nameOf(g.teamB[0])} & {nameOf(g.teamB[1])}
                          </span>
                          {done ? (
                            <span
                              className="text-[11px] font-semibold px-2 py-1 rounded-lg"
                              style={{ background: "#EFEBE0", color: INK_SOFT }}
                            >
                              Done
                            </span>
                          ) : onCourt ? (
                            <span
                              className="text-[11px] font-semibold px-2 py-1 rounded-lg"
                              style={{ background: "#EFEBE0", color: INK_SOFT }}
                            >
                              On court
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                onAssignGame(g.id, g.teamA, g.teamB)
                              }
                              disabled={!openCourtExists}
                              className="kq-btn text-xs font-semibold px-2 py-1 rounded-lg disabled:opacity-40"
                              style={{
                                background: "#FFAA1D",
                                color: "#0E2A26",
                              }}
                            >
                              Send
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {round.byes.length > 0 && (
                    <div
                      className="text-[11px] mt-2"
                      style={{ color: INK_SOFT }}
                    >
                      Bye: {round.byes.map(nameOf).join(", ")}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
