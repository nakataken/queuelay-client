import { RotateCcw } from "lucide-react";
import { Logo } from "./Logo";

export function Header({
  numCourts,
  onChangeCourtCount,
  onReset,
  canRemoveCourt,
  canAddCourt,
}: {
  numCourts: number;
  onChangeCourtCount: (delta: number) => void;
  onReset: () => void;
  canRemoveCourt: boolean;
  canAddCourt: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <Logo size={40} />
        <div>
          <h1 className="kq-display text-2xl sm:text-3xl font-bold text-white leading-none">
            Queuelay
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#9FC4BE" }}>
            Team Kulay &middot; Open Play Rotation
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <span className="text-xs font-medium" style={{ color: "#9FC4BE" }}>
            Courts
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeCourtCount(-1)}
              disabled={!canRemoveCourt}
              className="kq-btn w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "rgba(255,255,255,0.15)" }}
              aria-label="Remove a court"
            >
              −
            </button>
            <span className="kq-mono text-white w-5 text-center">
              {numCourts}
            </span>
            <button
              type="button"
              onClick={() => onChangeCourtCount(1)}
              disabled={!canAddCourt}
              className="kq-btn w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "rgba(255,255,255,0.15)" }}
              aria-label="Add a court"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="kq-btn flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.08)", color: "#9FC4BE" }}
          title="Clear roster, queue, courts, stats, and match history"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}
