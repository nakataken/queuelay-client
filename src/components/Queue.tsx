import React, { useState, useRef, useEffect } from "react";
import {
  Player,
  Court,
  PlayerStats,
  PlayerLevel,
  COURT_COLORS,
  SEED_ROSTER,
  STORAGE_KEY,
  LEVEL_CYCLE,
  BG,
} from "../types";
import { shuffle, combinations, levelSpread, loadSaved } from "../utils";
import { Header } from "./Header";
import { AvailablePanel } from "./AvailablePanel";
import { CourtsPanel } from "./CourtsPanel";
import { WaitingPanel } from "./WaitingPanel";
import { PlayerStatsPanel } from "./PlayerStatsPanel";

const saved = typeof window !== "undefined" ? loadSaved() : null;

export function Queue() {
  const [numCourts, setNumCourts] = useState<number>(saved?.numCourts ?? 2);
  const [courts, setCourts] = useState<Court[]>(
    saved?.courts ?? Array(2).fill(null),
  );
  const [roster, setRoster] = useState<Player[]>(
    saved?.roster ??
      SEED_ROSTER.map((p, i) => ({ id: i + 1, name: p.name, level: p.level })),
  );
  const [rosterLevel, setRosterLevel] = useState<PlayerLevel>("B");
  const [queueIds, setQueueIds] = useState<number[]>(saved?.queueIds ?? []);
  const [rosterInput, setRosterInput] = useState<string>("");
  const [requeue, setRequeue] = useState<boolean>(saved?.requeue ?? true);
  const [tick, setTick] = useState<number>(Date.now());
  const idRef = useRef<number>(saved?.nextId ?? SEED_ROSTER.length + 1);
  const colorRef = useRef<number>(saved?.colorCounter ?? 0);
  const [playerStats, setPlayerStats] = useState<Record<number, PlayerStats>>(
    saved?.playerStats ?? {},
  );
  const gameRef = useRef<number>(saved?.gameCounter ?? 0);

  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const nameOf = (id: number): string =>
    roster.find((r) => r.id === id)?.name || "—";
  const levelOf = (id: number): PlayerLevel =>
    roster.find((r) => r.id === id)?.level ?? "B";

  const playingIds = new Set<number>(courts.flatMap((c) => (c ? c.ids : [])));
  const waitingSet = new Set<number>(queueIds);
  const available = roster.filter(
    (r) => !playingIds.has(r.id) && !waitingSet.has(r.id),
  );

  const addRosterMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = rosterInput.trim();
    if (!name) return;
    setRoster((r) => [...r, { id: idRef.current++, name, level: rosterLevel }]);
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
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const checkIn = (id: number) => {
    setQueueIds((q) => (q.includes(id) ? q : [...q, id]));
  };

  const cycleLevel = (id: number) => {
    setRoster((r) =>
      r.map((p) => (p.id === id ? { ...p, level: LEVEL_CYCLE[p.level] } : p)),
    );
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

  const finalizeAssignment = (idx: number, group: number[]) => {
    const groupSet = new Set(group);
    const rest = queueIds.filter((id) => !groupSet.has(id));
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

  const assignToCourt = (idx: number) => {
    if (queueIds.length < 1) return;

    const withStats = shuffle(queueIds).map((id) => ({
      id,
      stats: playerStats[id] ?? { matches: 0, lastGame: 0 },
    }));
    withStats.sort((a, b) => {
      if (a.stats.matches !== b.stats.matches)
        return a.stats.matches - b.stats.matches;
      return a.stats.lastGame - b.stats.lastGame;
    });

    if (withStats.length <= 4) {
      finalizeAssignment(
        idx,
        withStats.map((p) => p.id),
      );
      return;
    }

    const cutoffMatches = withStats[3].stats.matches;
    const mandatory = withStats
      .filter((p) => p.stats.matches < cutoffMatches)
      .map((p) => p.id);
    const flexPool = withStats
      .filter((p) => p.stats.matches === cutoffMatches)
      .map((p) => p.id)
      .slice(0, 10);
    const flexSlots = 4 - mandatory.length;

    let bestGroup = [...mandatory, ...flexPool.slice(0, flexSlots)];
    let bestSpread = levelSpread(bestGroup, levelOf);

    for (const combo of combinations(flexPool, flexSlots)) {
      const candidate = [...mandatory, ...combo];
      const spread = levelSpread(candidate, levelOf);
      if (spread < bestSpread) {
        bestSpread = spread;
        bestGroup = candidate;
      }
    }

    finalizeAssignment(idx, bestGroup);
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

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          numCourts,
          courts,
          roster,
          queueIds,
          requeue,
          playerStats,
          nextId: idRef.current,
          colorCounter: colorRef.current,
          gameCounter: gameRef.current,
        }),
      );
    } catch {
      // storage unavailable — fail silently
    }
  }, [numCourts, courts, roster, queueIds, requeue, playerStats]);

  return (
    <div
      style={{
        background: BG,
        minHeight: "100%",
        fontFamily: "'Inter', sans-serif",
        color: "#0E2A26",
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
        <Header numCourts={numCourts} onChangeCourtCount={changeCourtCount} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          <div className="flex flex-col gap-5">
            <AvailablePanel
              available={available}
              rosterInput={rosterInput}
              setRosterInput={setRosterInput}
              rosterLevel={rosterLevel}
              setRosterLevel={setRosterLevel}
              onAddRosterMember={addRosterMember}
              onCheckIn={checkIn}
              onCycleLevel={cycleLevel}
              onRemoveRosterMember={removeRosterMember}
            />
            <CourtsPanel
              courts={courts}
              tick={tick}
              queueLength={queueIds.length}
              requeue={requeue}
              setRequeue={setRequeue}
              onAssignToCourt={assignToCourt}
              onFinishGame={finishGame}
              nameOf={nameOf}
              levelOf={levelOf}
            />
          </div>

          <div>
            <WaitingPanel
              queueIds={queueIds}
              nameOf={nameOf}
              nextUp={nextUp}
              openCourtExists={openCourtExists}
              onMoveQueue={moveQueue}
              onRemoveFromQueue={removeFromQueue}
            />
            <PlayerStatsPanel
              roster={roster}
              playerStats={playerStats}
              gameCount={gameRef.current}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
