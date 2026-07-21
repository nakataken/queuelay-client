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
  MatchMode,
} from "../types";
import {
  shuffle,
  bestTeamSplit,
  loadSaved,
  pickNextGroup,
  effectiveMode,
} from "../utils";
import { ModeSelector } from "../components/ModeSelector";
import { Header } from "./Header";
import { AvailablePanel } from "./AvailablePanel";
import { CourtsPanel } from "./CourtsPanel";
import { WaitingPanel } from "./WaitingPanel";
import { PlayerStatsPanel } from "./PlayerStatsPanel";
import { MatchRecord } from "../types";
import { TabBar, TabKey } from "../components/TabBar";
import { MatchHistoryPanel } from "../components/MatchHistoryPanel";

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
  const [rosterLevel, setRosterLevel] = useState<PlayerLevel>("A");
  const [queueIds, setQueueIds] = useState<number[]>(saved?.queueIds ?? []);
  const [rosterInput, setRosterInput] = useState<string>("");
  const [requeue, setRequeue] = useState<boolean>(saved?.requeue ?? true);
  const [tick, setTick] = useState<number>(Date.now());
  const idRef = useRef<number>(saved?.nextId ?? SEED_ROSTER.length + 1);
  const colorRef = useRef<number>(saved?.colorCounter ?? 0);
  const [playerStats, setPlayerStats] = useState<Record<number, PlayerStats>>(
    saved?.playerStats ?? {},
  );
  const [matchMode, setMatchMode] = useState<MatchMode>(
    saved?.matchMode ?? "mixed",
  );
  const [matches, setMatches] = useState<MatchRecord[]>(saved?.matches ?? []);
  const [activeTab, setActiveTab] = useState<TabKey>("queue");

  const gameRef = useRef<number>(saved?.gameCounter ?? 0);

  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const nameOf = (id: number): string =>
    roster.find((r) => r.id === id)?.name || "—";
  const levelOf = (id: number): PlayerLevel =>
    roster.find((r) => r.id === id)?.level ?? "B";
  const resultOf = (id: number): "W" | "L" | null =>
    playerStats[id]?.lastResult ?? null;

  const playingIds = new Set<number>(courts.flatMap((c) => (c ? c.ids : [])));
  const waitingSet = new Set<number>(queueIds);
  const available = roster.filter(
    (r) => !playingIds.has(r.id) && !waitingSet.has(r.id),
  );
  const waitingPlayers = roster.filter((r) => waitingSet.has(r.id));

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

  const shuffleQueue = () => {
    setQueueIds((q) => shuffle(q));
  };

  const finalizeAssignment = (
    idx: number,
    teamA: number[],
    teamB: number[],
  ) => {
    const group = [...teamA, ...teamB];
    const groupSet = new Set(group);
    const rest = queueIds.filter((id) => !groupSet.has(id));
    const color = COURT_COLORS[colorRef.current % COURT_COLORS.length];
    colorRef.current += 1;
    gameRef.current += 1;
    const gameNumber = gameRef.current;
    const startedAt = Date.now();

    setQueueIds(rest);
    setCourts((c) => {
      const copy = [...c];
      copy[idx] = {
        ids: group,
        teams: { teamA, teamB },
        color,
        startedAt,
        gameNumber,
      };
      return copy;
    });

    setPlayerStats((prev) => {
      const next = { ...prev };
      group.forEach((id) => {
        const existing = next[id] ?? {
          matches: 0,
          lastGame: 0,
          wins: 0,
          losses: 0,
        };
        next[id] = {
          ...existing,
          matches: existing.matches + 1,
          lastGame: gameNumber,
        };
      });
      return next;
    });

    setMatches((prev) => [
      ...prev,
      {
        gameNumber,
        courtIndex: idx,
        teamA,
        teamB,
        color,
        startedAt,
        finishedAt: null,
        winner: null,
      },
    ]);
  };

  const assignToCourt = (idx: number) => {
    const group = pickNextGroup(
      queueIds,
      playerStats,
      levelOf,
      matchMode,
      resultOf,
    );
    if (group.length < 1) return;
    const activeMode = effectiveMode(group, matchMode, resultOf);
    const split = bestTeamSplit(group, levelOf, activeMode, resultOf);
    finalizeAssignment(idx, split.teamA, split.teamB);
  };

  const finishGame = (idx: number, winner: "A" | "B") => {
    const court = courts[idx];
    setCourts((c) => {
      const copy = [...c];
      copy[idx] = null;
      return copy;
    });
    if (court && requeue) {
      setQueueIds((q) => [...q, ...court.ids]);
    }
    if (court) {
      const winningIds = winner === "A" ? court.teams.teamA : court.teams.teamB;
      const losingIds = winner === "A" ? court.teams.teamB : court.teams.teamA;
      setPlayerStats((prev) => {
        const next = { ...prev };
        winningIds.forEach((id) => {
          const existing = next[id] ?? {
            matches: 0,
            lastGame: 0,
            wins: 0,
            losses: 0,
            lastResult: null,
          };
          next[id] = { ...existing, wins: existing.wins + 1, lastResult: "W" };
        });
        losingIds.forEach((id) => {
          const existing = next[id] ?? {
            matches: 0,
            lastGame: 0,
            wins: 0,
            losses: 0,
            lastResult: null,
          };
          next[id] = {
            ...existing,
            losses: existing.losses + 1,
            lastResult: "L",
          };
        });
        return next;
      });
      setMatches((prev) =>
        prev.map((m) =>
          m.gameNumber === court.gameNumber
            ? { ...m, finishedAt: Date.now(), winner }
            : m,
        ),
      );
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

  const shuffleCourtTeams = (idx: number) => {
    const court = courts[idx];
    if (!court) return;
    const shuffled = shuffle(court.ids);
    const teamA = shuffled.slice(0, 2);
    const teamB = shuffled.slice(2, 4);

    setCourts((c) => {
      const copy = [...c];
      copy[idx] = { ...court, teams: { teamA, teamB } };
      return copy;
    });
    setMatches((prev) =>
      prev.map((m) =>
        m.gameNumber === court.gameNumber ? { ...m, teamA, teamB } : m,
      ),
    );
  };

  const manualAssign = (idx: number, selectedIds: number[]) => {
    if (selectedIds.length !== 4) return;
    const split = bestTeamSplit(selectedIds, levelOf, matchMode, resultOf);
    finalizeAssignment(idx, split.teamA, split.teamB);
  };

  const resetAll = () => {
    if (
      !window.confirm(
        "Reset everything? This clears the roster, queue, courts, player stats, and match history. This can't be undone.",
      )
    )
      return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setNumCourts(2);
    setCourts(Array(2).fill(null));
    setRoster(
      SEED_ROSTER.map((p, i) => ({ id: i + 1, name: p.name, level: p.level })),
    );
    setQueueIds([]);
    setRequeue(true);
    setPlayerStats({});
    setMatches([]);
    idRef.current = SEED_ROSTER.length + 1;
    colorRef.current = 0;
    gameRef.current = 0;
  };

  const nextUp = pickNextGroup(
    queueIds,
    playerStats,
    levelOf,
    matchMode,
    resultOf,
  );

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
          matches,
          matchMode,
          nextId: idRef.current,
          colorCounter: colorRef.current,
          gameCounter: gameRef.current,
        }),
      );
    } catch {
      // storage unavailable — fail silently
    }
  }, [numCourts, courts, roster, queueIds, requeue, playerStats, matches]);

  return (
    <div
      style={{
        background: BG,
        minHeight: "100vh",
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
        <Header
          numCourts={numCourts}
          onChangeCourtCount={changeCourtCount}
          onReset={resetAll}
        />
        <TabBar active={activeTab} onChange={setActiveTab} />

        {activeTab === "queue" && (
          <ModeSelector mode={matchMode} onChange={setMatchMode} />
        )}

        {activeTab === "queue" ? (
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
            <WaitingPanel
              queueIds={queueIds}
              nameOf={nameOf}
              nextUp={nextUp}
              openCourtExists={openCourtExists}
              onMoveQueue={moveQueue}
              onRemoveFromQueue={removeFromQueue}
              onShuffle={shuffleQueue}
              mode={matchMode}
            />
            <CourtsPanel
              courts={courts}
              tick={tick}
              queueLength={queueIds.length}
              requeue={requeue}
              setRequeue={setRequeue}
              onAssignToCourt={assignToCourt}
              onFinishGame={finishGame}
              onShuffleCourt={shuffleCourtTeams}
              onManualAssign={manualAssign}
              waitingPlayers={waitingPlayers}
              nameOf={nameOf}
              levelOf={levelOf}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <MatchHistoryPanel matches={matches} nameOf={nameOf} />
            <PlayerStatsPanel
              roster={roster.filter(
                (p) => playingIds.has(p.id) || waitingSet.has(p.id),
              )}
              playerStats={playerStats}
              gameCount={gameRef.current}
            />
          </div>
        )}
      </div>
    </div>
  );
}
