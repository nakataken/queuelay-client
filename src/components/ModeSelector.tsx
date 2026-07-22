import { MatchMode, MATCH_MODE_LABEL } from "../types";

export function ModeSelector({
  mode,
  onChange,
}: {
  mode: MatchMode;
  onChange: (m: MatchMode) => void;
}) {
  const modes: MatchMode[] = ["mixed", "competitive", "winloss"];
  return (
    <div
      className="flex gap-1 mb-5 rounded-xl p-1"
      role="radiogroup"
      aria-label="Match mode"
      style={{ background: "rgba(255,255,255,0.08)" }}
    >
      {modes.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => onChange(m)}
          className="kq-btn flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold"
          style={{
            background: mode === m ? "#FFFFFF" : "transparent",
            color: mode === m ? "#0E2A26" : "#9FC4BE",
          }}
        >
          {MATCH_MODE_LABEL[m]}
        </button>
      ))}
    </div>
  );
}
