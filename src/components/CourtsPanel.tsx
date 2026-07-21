import { Timer } from "lucide-react";
import { Court, PlayerLevel, CARD, INK } from "../types";
import { fmtClock } from "../utils";
import { LevelBadge } from "./LevelBadge";

export function CourtsPanel({
  courts,
  tick,
  queueLength,
  requeue,
  setRequeue,
  onAssignToCourt,
  onFinishGame,
  nameOf,
  levelOf,
}: {
  courts: Court[];
  tick: number;
  queueLength: number;
  requeue: boolean;
  setRequeue: (v: boolean) => void;
  onAssignToCourt: (idx: number) => void;
  onFinishGame: (idx: number) => void;
  nameOf: (id: number) => string;
  levelOf: (id: number) => PlayerLevel;
}) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courts.map((court, idx) => (
          <div
            key={idx}
            className="rounded-2xl overflow-hidden"
            style={{
              background: court ? CARD : "transparent",
              border: court ? "none" : `2px dashed rgba(255,255,255,0.3)`,
            }}
          >
            {court ? (
              <>
                <div style={{ background: court.color.bg }} className="h-2" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="kq-display font-semibold text-sm"
                      style={{ color: INK }}
                    >
                      Court {idx + 1}
                    </span>
                    <span
                      className="kq-mono text-xs flex items-center gap-1 px-2 py-1 rounded-full"
                      style={{
                        background: court.color.soft,
                        color: court.color.bg,
                      }}
                    >
                      <Timer size={12} /> {fmtClock(tick - court.startedAt)}
                    </span>
                  </div>

                  {/* 2v2 matchup, split by a net-style divider */}
                  <div
                    className="rounded-xl overflow-hidden mb-4 flex"
                    style={{
                      background: "#1C6B4A",
                      border: "3px solid rgba(255,255,255,0.85)",
                    }}
                  >
                    {/* Team A — left side */}
                    <div className="relative flex-1 flex flex-col items-center justify-center gap-1.5 px-2 py-3">
                      {/* center service line */}
                      <div
                        className="absolute left-1 right-1 top-1/2 h-px"
                        style={{ background: "rgba(255,255,255,0.4)" }}
                      />
                      {court.teams.teamA.map((id) => (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold z-10"
                          style={{ color: "#fff" }}
                        >
                          <LevelBadge level={levelOf(id)} />
                          {nameOf(id)}
                        </span>
                      ))}
                    </div>

                    {/* Kitchen (non-volley zone) band */}
                    <div
                      style={{ width: 1, background: "rgba(255,255,255,0.5)" }}
                    />
                    <div
                      style={{ width: 8, background: "rgba(255,255,255,0.08)" }}
                    />

                    {/* Net */}
                    <div
                      className="relative flex items-center justify-center"
                      style={{
                        width: 10,
                        background:
                          "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 2px, transparent 2px, transparent 6px)",
                      }}
                    >
                      <span
                        className="kq-mono absolute text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: court.color.bg,
                          color: "#fff",
                          writingMode: "vertical-rl",
                        }}
                      >
                        VS
                      </span>
                    </div>

                    {/* Kitchen (non-volley zone) band */}
                    <div
                      style={{ width: 8, background: "rgba(255,255,255,0.08)" }}
                    />
                    <div
                      style={{ width: 1, background: "rgba(255,255,255,0.5)" }}
                    />

                    {/* Team B — right side */}
                    <div className="relative flex-1 flex flex-col items-center justify-center gap-1.5 px-2 py-3">
                      <div
                        className="absolute left-1 right-1 top-1/2 h-px"
                        style={{ background: "rgba(255,255,255,0.4)" }}
                      />
                      {court.teams.teamB.map((id) => (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold z-10"
                          style={{ color: "#fff" }}
                        >
                          <LevelBadge level={levelOf(id)} />
                          {nameOf(id)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onFinishGame(idx)}
                    className="kq-btn w-full rounded-lg py-2 text-sm font-semibold"
                    style={{ background: INK, color: "#fff" }}
                  >
                    Finish game
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 flex flex-col items-center justify-center text-center min-h-[168px]">
                <span
                  className="kq-display text-sm font-semibold mb-1"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  Court {idx + 1} &middot; Open
                </span>
                <span className="text-xs mb-3" style={{ color: "#9FC4BE" }}>
                  {queueLength > 0
                    ? `Ready for ${Math.min(4, queueLength)} player${Math.min(4, queueLength) === 1 ? "" : "s"}`
                    : "Waiting for check-ins"}
                </span>
                <button
                  onClick={() => onAssignToCourt(idx)}
                  disabled={queueLength === 0}
                  className="kq-btn rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                  }}
                >
                  Send next up
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <label
        className="flex items-center gap-2 mt-4 text-xs sm:text-sm"
        style={{ color: "#9FC4BE" }}
      >
        <input
          type="checkbox"
          checked={requeue}
          onChange={(e) => setRequeue(e.target.checked)}
          className="rounded"
        />
        Send players back to the queue when a game finishes
      </label>
    </div>
  );
}
