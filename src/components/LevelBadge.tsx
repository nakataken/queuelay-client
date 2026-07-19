import { PlayerLevel, LEVEL_LABEL, LEVEL_COLOR } from "../types";

export function LevelBadge({
  level,
  onClick,
}: {
  level: PlayerLevel;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={LEVEL_LABEL[level]}
      className="kq-mono text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: LEVEL_COLOR[level],
        color: "#fff",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {level}
    </button>
  );
}
