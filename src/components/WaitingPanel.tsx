import { ChevronUp, ChevronDown, UserPlus, X } from "lucide-react";
import { CARD, CARD_LINE, INK, INK_SOFT } from "../types";
import { Shuffle } from "lucide-react";

export function WaitingPanel({
  queueIds,
  nameOf,
  nextUp,
  openCourtExists,
  onMoveQueue,
  onRemoveFromQueue,
  onShuffle,
}: {
  queueIds: number[];
  nameOf: (id: number) => string;
  nextUp: number[];
  openCourtExists: boolean;
  onMoveQueue: (id: number, dir: 1 | -1) => void;
  onRemoveFromQueue: (id: number) => void;
  onShuffle: () => void;
}) {
  return (
    <div className="rounded-2xl p-4 h-fit" style={{ background: CARD }}>
      <div className="flex items-center justify-between mb-3">
        <span
          className="kq-display font-semibold flex items-center gap-1.5"
          style={{ color: INK }}
        >
          <UserPlus size={16} /> Waiting
        </span>
        <div className="flex items-center gap-2">
          <span
            className="kq-mono text-xs px-2 py-0.5 rounded-full"
            style={{ background: "#EFEBE0", color: INK_SOFT }}
          >
            {queueIds.length}
          </span>
          <button
            onClick={onShuffle}
            disabled={queueIds.length < 2}
            className="kq-btn flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full disabled:opacity-30"
            style={{ background: "#EFEBE0", color: INK }}
            title="Shuffle the waiting order"
          >
            <Shuffle size={12} /> Shuffle
          </button>
        </div>
      </div>

      {queueIds.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: INK_SOFT }}>
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
                onClick={() => onMoveQueue(id, -1)}
                disabled={i === 0}
                className="disabled:opacity-30"
              >
                <ChevronUp size={15} style={{ color: INK_SOFT }} />
              </button>
              <button
                onClick={() => onMoveQueue(id, 1)}
                disabled={i === queueIds.length - 1}
                className="disabled:opacity-30"
              >
                <ChevronDown size={15} style={{ color: INK_SOFT }} />
              </button>
              <button
                onClick={() => onRemoveFromQueue(id)}
                title="Back to available"
              >
                <X size={15} style={{ color: INK_SOFT }} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {nextUp.length > 0 && (
        <div className="pt-3" style={{ borderTop: `1px solid ${CARD_LINE}` }}>
          <span className="text-xs font-semibold" style={{ color: INK_SOFT }}>
            Up next{!openCourtExists ? " (waiting for an open court)" : ""}
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
    </div>
  );
}
