export default function TabBar({ tabs, active, onChange, sortValue, onSortChange }) {
  return (
    <div className="flex items-center justify-between border-b border-[color:var(--border)] mb-6">
      <div className="flex items-center gap-6">
        {tabs.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange?.(t.key)}
              className={`relative pb-3 text-sm font-medium flex items-center gap-2 transition-colors ${isActive ? "text-[color:var(--brand)]" : "text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]"
                }`}
            >
              {t.label}
              {t.count != null && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded ${isActive ? "bg-[color:var(--brand-soft)] text-[color:var(--brand)]" : "bg-[color:var(--surface-muted)] text-[color:var(--ink-muted)]"}`}>
                  {t.count}
                </span>
              )}
              {isActive && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[color:var(--brand)] rounded-full" />}
            </button>
          );
        })}
      </div>
      {onSortChange && (
        <div className="flex items-center gap-2 text-sm pb-3">
          <span className="text-[color:var(--ink-muted)]">Sort By</span>
          <select value={sortValue} onChange={(e) => onSortChange(e.target.value)}
            className="bg-[color:var(--surface-muted)] rounded-lg px-3 py-1.5 text-sm font-medium outline-none">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      )}
    </div>
  );
}
