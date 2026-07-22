import React from "react";
import { Users, Plus, X } from "lucide-react";
import { Player, PlayerLevel, CARD, CARD_LINE, INK, INK_SOFT } from "../types";
import { LevelBadge } from "./LevelBadge";

export function AvailablePanel({
  available,
  rosterInput,
  setRosterInput,
  rosterLevel,
  setRosterLevel,
  onAddRosterMember,
  onCheckIn,
  onCycleLevel,
  onRemoveRosterMember,
}: {
  available: Player[];
  rosterInput: string;
  setRosterInput: (v: string) => void;
  rosterLevel: PlayerLevel;
  setRosterLevel: (v: PlayerLevel) => void;
  onAddRosterMember: (e: React.FormEvent<HTMLFormElement>) => void;
  onCheckIn: (id: number) => void;
  onCycleLevel: (id: number) => void;
  onRemoveRosterMember: (id: number) => void;
}) {
  return (
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
        <p className="text-sm py-3 text-center" style={{ color: INK_SOFT }}>
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
              <LevelBadge level={p.level} onClick={() => onCycleLevel(p.id)} />
              <button
                type="button"
                onClick={() => onCheckIn(p.id)}
                className="text-sm font-medium px-2.5 py-1.5 rounded-full"
                style={{ color: INK }}
                title="Tap to check in"
              >
                {p.name}
              </button>
              <button
                type="button"
                onClick={() => onRemoveRosterMember(p.id)}
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
        onSubmit={onAddRosterMember}
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
        <select
          value={rosterLevel}
          onChange={(e) => setRosterLevel(e.target.value as PlayerLevel)}
          className="rounded-lg px-2 text-sm mt-3"
          style={{ background: "#F4F2EA", color: INK }}
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
        <button
          type="submit"
          className="kq-btn rounded-lg px-3 mt-3 flex items-center gap-1 text-sm font-semibold"
          style={{ background: "#FFAA1D", color: INK }}
        >
          <Plus size={16} strokeWidth={2.5} /> Add
        </button>
      </form>
    </div>
  );
}
