export type TabKey = "queue" | "history";

export function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "queue", label: "Queue" },
    { key: "history", label: "Match History" },
  ];

  return (
    <div className="flex justify-center mb-6">
      <div
        className="inline-flex gap-1 rounded-xl p-1 w-full sm:w-auto"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className="kq-btn flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold outline-none"
            style={{
              background: active === t.key ? "#FFFFFF" : "transparent",
              color: active === t.key ? "#0E2A26" : "#9FC4BE",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
