import { COURT_COLORS, BG } from "../types";
import { Logo } from "./Logo";

export function Header({
  numCourts,
  onChangeCourtCount,
}: {
  numCourts: number;
  onChangeCourtCount: (delta: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
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
            onClick={() => onChangeCourtCount(-1)}
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
            onClick={() => onChangeCourtCount(1)}
            className="kq-btn w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ background: "rgba(255,255,255,0.15)" }}
            aria-label="Add a court"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
