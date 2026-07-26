import {
  MatchCategory,
  MATCH_CATEGORY_LABEL,
  MATCH_CATEGORY_DESC,
} from "../types";

export function CategorySelector({
  category,
  onChange,
}: {
  category: MatchCategory;
  onChange: (c: MatchCategory) => void;
}) {
  const categories: MatchCategory[] = ["freeplay", "mixer"];
  return (
    <div className="mb-3">
      <div
        className="flex gap-1 rounded-xl p-1"
        role="radiogroup"
        aria-label="Match category"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={category === c}
            onClick={() => onChange(c)}
            title={MATCH_CATEGORY_DESC[c]}
            className="kq-btn flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold"
            style={{
              background: category === c ? "#FFFFFF" : "transparent",
              color: category === c ? "#0E2A26" : "#9FC4BE",
            }}
          >
            {MATCH_CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <p className="text-xs mt-1.5 px-1" style={{ color: "#9FC4BE" }}>
        {MATCH_CATEGORY_DESC[category]}
      </p>
    </div>
  );
}
