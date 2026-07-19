import React, { useState, useRef, useEffect } from "react";
import {
  X,
  ChevronUp,
  ChevronDown,
  Users,
  Timer,
  UserPlus,
  Plus,
} from "lucide-react";

// ---- Types -----------------------------------------------------------

interface Player {
  id: number;
  name: string;
}

interface CourtColor {
  name: string;
  bg: string;
  soft: string;
}

interface ActiveCourt {
  ids: number[];
  color: CourtColor;
  startedAt: number;
}

interface PlayerStats {
  matches: number;
  lastGame: number; // 0 = never played
}

type Court = ActiveCourt | null;

// ---- Constants ---------------------------------------------------------

// Kulay ("color") palette — each round of court assignment cycles through these,
// so the board visually fills with color the way an open-play session fills with people.
const COURT_COLORS: CourtColor[] = [
  { name: "Papaya", bg: "#FF7A45", soft: "#FFE7DA" },
  { name: "Guava", bg: "#FF4D8D", soft: "#FFDCE9" },
  { name: "Ube", bg: "#7C5CFF", soft: "#E6E0FF" },
  { name: "Limon", bg: "#86B916", soft: "#E9F3C9" },
  { name: "Mango", bg: "#FFAA1D", soft: "#FFECC8" },
  { name: "Sky", bg: "#1FA3C9", soft: "#D6F0F7" },
];

const INK = "#0E2A26";
const INK_SOFT = "#4E6B65";
const BG = "#0B3B3A";
const CARD = "#FFFFFF";
const CARD_LINE = "#DCEAE6";

function fmtClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SEED_ROSTER: string[] = [
  "Acob",
  "Bryan",
  "Chad",
  "Chacha",
  "Clarissa",
  "Dan",
  "Irish",
  "Jiemuel",
  "Osong",
  "Khaye",
  "Ken",
  "Kevin",
  "Kleo",
  "Mac",
  "Rose",
  "Roy",
  "Ryan",
  "Sandee",
  "Topher",
  "Trixie",
].sort();

export default function App() {
  const [numCourts, setNumCourts] = useState<number>(2);
  const [courts, setCourts] = useState<Court[]>(Array(2).fill(null));
  const [roster, setRoster] = useState<Player[]>(() =>
    SEED_ROSTER.map((name, i) => ({ id: i + 1, name })),
  );
  const [queueIds, setQueueIds] = useState<number[]>([]);
  const [rosterInput, setRosterInput] = useState<string>("");
  const [requeue, setRequeue] = useState<boolean>(true);
  const [tick, setTick] = useState<number>(Date.now());
  const idRef = useRef<number>(SEED_ROSTER.length + 1);
  const colorRef = useRef<number>(0);
  const [playerStats, setPlayerStats] = useState<Record<number, PlayerStats>>(
    {},
  );
  const gameRef = useRef<number>(0);

  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const nameOf = (id: number): string =>
    roster.find((r) => r.id === id)?.name || "—";

  const playingIds = new Set<number>(courts.flatMap((c) => (c ? c.ids : [])));
  const waitingSet = new Set<number>(queueIds);
  const available = roster.filter(
    (r) => !playingIds.has(r.id) && !waitingSet.has(r.id),
  );

  const addRosterMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = rosterInput.trim();
    if (!name) return;
    setRoster((r) => [...r, { id: idRef.current++, name }]);
    setRosterInput("");
  };

  const removeRosterMember = (id: number) => {
    setRoster((r) => r.filter((p) => p.id !== id));
    setQueueIds((q) => q.filter((qid) => qid !== id));
    setCourts((c) =>
      c.map((court) =>
        court
          ? { ...court, ids: court.ids.filter((cid) => cid !== id) }
          : court,
      ),
    );
    setPlayerStats((prev) => {
      const { [id]: _, ...rest } = prev; // eslint-disable-line @typescript-eslint/no-unused-vars
      return rest;
    });
  };

  const checkIn = (id: number) => {
    setQueueIds((q) => (q.includes(id) ? q : [...q, id]));
  };

  const removeFromQueue = (id: number) =>
    setQueueIds((q) => q.filter((qid) => qid !== id));

  const moveQueue = (id: number, dir: 1 | -1) => {
    setQueueIds((q) => {
      const i = q.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= q.length) return q;
      const copy = [...q];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  };

  const assignToCourt = (idx: number) => {
    if (queueIds.length < 1) return;

    // Randomize first so ties (same matches, same lastGame) break randomly,
    // then stable-sort by fewest matches, then longest since their last game.
    const withStats = shuffle(queueIds).map((id) => ({
      id,
      stats: playerStats[id] ?? { matches: 0, lastGame: 0 },
    }));
    withStats.sort((a, b) => {
      if (a.stats.matches !== b.stats.matches)
        return a.stats.matches - b.stats.matches;
      return a.stats.lastGame - b.stats.lastGame;
    });

    const group = withStats.slice(0, 4).map((p) => p.id);
    const groupSet = new Set(group);
    const rest = queueIds.filter((id) => !groupSet.has(id)); // keep original queue order for those left

    const color = COURT_COLORS[colorRef.current % COURT_COLORS.length];
    colorRef.current += 1;
    gameRef.current += 1;
    const gameNumber = gameRef.current;

    setQueueIds(rest);
    setCourts((c) => {
      const copy = [...c];
      copy[idx] = { ids: group, color, startedAt: Date.now() };
      return copy;
    });
    setPlayerStats((prev) => {
      const next = { ...prev };
      group.forEach((id) => {
        const existing = next[id] ?? { matches: 0, lastGame: 0 };
        next[id] = { matches: existing.matches + 1, lastGame: gameNumber };
      });
      return next;
    });
  };

  const finishGame = (idx: number) => {
    const court = courts[idx];
    setCourts((c) => {
      const copy = [...c];
      copy[idx] = null;
      return copy;
    });
    if (court && requeue) {
      setQueueIds((q) => [...q, ...court.ids]);
    }
  };

  const changeCourtCount = (delta: number) => {
    setNumCourts((n) => {
      const next = Math.min(10, Math.max(1, n + delta));
      setCourts((c) => {
        if (next > c.length)
          return [...c, ...Array(next - c.length).fill(null)];
        const dropped = c.slice(next);
        if (dropped.some((x) => x)) return c;
        return c.slice(0, next);
      });
      return next;
    });
  };

  const nextUp = queueIds.slice(0, 4);
  const openCourtExists = courts.some((c) => !c);

  return (
    <div
      style={{
        background: BG,
        minHeight: "100%",
        fontFamily: "'Inter', sans-serif",
        color: INK,
      }}
      className="w-full min-h-screen"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        .kq-display { font-family: 'Baloo 2', 'Inter', sans-serif; }
        .kq-mono { font-family: 'JetBrains Mono', monospace; }
        .kq-btn { transition: transform .12s ease, box-shadow .12s ease; }
        .kq-btn:active { transform: scale(0.96); }
        .kq-chip { transition: transform .12s ease, box-shadow .12s ease; }
        .kq-chip:hover { transform: translateY(-1px); }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {COURT_COLORS.slice(0, 4).map((c, i) => (
                <div
                  key={i}
                  style={{ background: c.bg, borderColor: BG }}
                  className="w-4 h-4 rounded-full border-2"
                />
              ))}
            </div>
            <div>
              <h1 className="kq-display text-2xl sm:text-3xl font-bold text-white leading-none">
                KulayQueue
              </h1>
              <p
                className="text-xs sm:text-sm mt-1"
                style={{ color: "#9FC4BE" }}
              >
                Team Kulay &middot; Open Play Rotation
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-3 rounded-xl px-3 py-2"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <span className="text-xs font-medium" style={{ color: "#9FC4BE" }}>
              Courts
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeCourtCount(-1)}
                className="kq-btn w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ background: "rgba(255,255,255,0.15)" }}
                aria-label="Remove a court"
              >
                −
              </button>
              <span className="kq-mono text-white w-5 text-center">
                {numCourts}
              </span>
              <button
                onClick={() => changeCourtCount(1)}
                className="kq-btn w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ background: "rgba(255,255,255,0.15)" }}
                aria-label="Add a court"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Left column: Available roster + Courts */}
          <div className="flex flex-col gap-5">
            {/* Available players */}
            <div className="rounded-2xl p-4" style={{ background: CARD }}>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="kq-display font-semibold flex items-center gap-1.5"
                  style={{ color: INK }}
                >
                  <Users size={16} /> Available
                </span>
                <span
                  className="kq-mono text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "#EFEBE0", color: INK_SOFT }}
                >
                  {available.length}
                </span>
              </div>

              {available.length === 0 ? (
                <p
                  className="text-sm py-3 text-center"
                  style={{ color: INK_SOFT }}
                >
                  Everyone on the roster is checked in or playing.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-3">
                  {available.map((p) => (
                    <div
                      key={p.id}
                      className="kq-chip flex items-center gap-1 rounded-full pl-1 pr-1"
                      style={{
                        background: "#F4F2EA",
                        border: `1px solid ${CARD_LINE}`,
                      }}
                    >
                      <button
                        onClick={() => checkIn(p.id)}
                        className="text-sm font-medium px-2.5 py-1.5 rounded-full"
                        style={{ color: INK }}
                        title="Tap to check in"
                      >
                        {p.name}
                      </button>
                      <button
                        onClick={() => removeRosterMember(p.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-full"
                        title="Remove from roster"
                        style={{ color: INK_SOFT }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={addRosterMember}
                className="flex gap-2 pt-1"
                style={{ borderTop: `1px solid ${CARD_LINE}` }}
              >
                <input
                  value={rosterInput}
                  onChange={(e) => setRosterInput(e.target.value)}
                  placeholder="Add a member to the roster"
                  className="flex-1 rounded-lg px-3 py-2 text-sm outline-none mt-3"
                  style={{ background: "#F4F2EA", color: INK }}
                />
                <button
                  type="submit"
                  className="kq-btn rounded-lg px-3 mt-3 flex items-center gap-1 text-sm font-semibold"
                  style={{ background: "#FFAA1D", color: INK }}
                >
                  <Plus size={16} strokeWidth={2.5} /> Add
                </button>
              </form>
            </div>

            {/* Courts */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courts.map((court, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: court ? CARD : "transparent",
                      border: court
                        ? "none"
                        : `2px dashed rgba(255,255,255,0.3)`,
                    }}
                  >
                    {court ? (
                      <>
                        <div
                          style={{ background: court.color.bg }}
                          className="h-2"
                        />
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
                              <Timer size={12} />{" "}
                              {fmtClock(tick - court.startedAt)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {court.ids.map((id) => (
                              <span
                                key={id}
                                className="text-xs sm:text-sm px-2.5 py-1 rounded-lg font-medium"
                                style={{
                                  background: court.color.soft,
                                  color: INK,
                                }}
                              >
                                {nameOf(id)}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => finishGame(idx)}
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
                        <span
                          className="text-xs mb-3"
                          style={{ color: "#9FC4BE" }}
                        >
                          {queueIds.length > 0
                            ? `Ready for ${Math.min(4, queueIds.length)} player${Math.min(4, queueIds.length) === 1 ? "" : "s"}`
                            : "Waiting for check-ins"}
                        </span>
                        <button
                          onClick={() => assignToCourt(idx)}
                          disabled={queueIds.length === 0}
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
          </div>

          {/* Waiting queue */}
          <div className="rounded-2xl p-4 h-fit" style={{ background: CARD }}>
            <div className="flex items-center justify-between mb-3">
              <span
                className="kq-display font-semibold flex items-center gap-1.5"
                style={{ color: INK }}
              >
                <UserPlus size={16} /> Waiting
              </span>
              <span
                className="kq-mono text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#EFEBE0", color: INK_SOFT }}
              >
                {queueIds.length}
              </span>
            </div>

            {queueIds.length === 0 ? (
              <p
                className="text-sm py-6 text-center"
                style={{ color: INK_SOFT }}
              >
                No one's waiting. Tap a name under Available to check them in.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5 mb-3">
                {queueIds.map((id, i) => (
                  <li
                    key={id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                    style={{ border: `1px solid ${CARD_LINE}` }}
                  >
                    <span
                      className="kq-mono text-xs w-4 text-right"
                      style={{ color: INK_SOFT }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-sm flex-1 font-medium"
                      style={{ color: INK }}
                    >
                      {nameOf(id)}
                    </span>
                    <button
                      onClick={() => moveQueue(id, -1)}
                      disabled={i === 0}
                      className="disabled:opacity-30"
                    >
                      <ChevronUp size={15} style={{ color: INK_SOFT }} />
                    </button>
                    <button
                      onClick={() => moveQueue(id, 1)}
                      disabled={i === queueIds.length - 1}
                      className="disabled:opacity-30"
                    >
                      <ChevronDown size={15} style={{ color: INK_SOFT }} />
                    </button>
                    <button
                      onClick={() => removeFromQueue(id)}
                      title="Back to available"
                    >
                      <X size={15} style={{ color: INK_SOFT }} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {nextUp.length > 0 && (
              <div
                className="pt-3"
                style={{ borderTop: `1px solid ${CARD_LINE}` }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: INK_SOFT }}
                >
                  Up next
                  {!openCourtExists ? " (waiting for an open court)" : ""}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {nextUp.map((id) => (
                    <span
                      key={id}
                      className="text-xs px-2 py-1 rounded-lg font-medium"
                      style={{ background: "#FFF6E5", color: "#8A5B00" }}
                    >
                      {nameOf(id)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div
              className="rounded-2xl p-4 h-fit mt-5"
              style={{ background: CARD }}
            >
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
                  Game {gameRef.current}
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
                      const stats = playerStats[p.id] ?? {
                        matches: 0,
                        lastGame: 0,
                      };
                      return (
                        <tr
                          key={p.id}
                          style={{ borderTop: `1px solid ${CARD_LINE}` }}
                        >
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
          </div>
        </div>
      </div>
    </div>
  );
}
