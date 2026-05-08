const variants = {
  progress: { bg: "bg-[color:var(--brand)]", text: "text-white" },

  // ❌ You can remove this if not used anymore
  // review: { bg: "bg-amber-500", text: "text-white" },

  overdue: { bg: "bg-red-500", text: "text-white" },   // ✅ ADD THIS

  done: { bg: "bg-emerald-500", text: "text-white" },
};

export default function StatusPill({ count, label, variant = "progress", onAdd }) {
  const v = variants[variant] || variants.progress;

  return (
    <div className={`flex items-center justify-between gap-3 ${v.bg} ${v.text} rounded-full px-2 py-1 pl-2 pr-2`}>
      <div className="flex items-center gap-2">
        <span className="bg-white/25 text-xs font-bold rounded-full h-6 w-6 grid place-items-center">
          {count}
        </span>
        <span className="font-semibold text-sm pr-2">{label}</span>
      </div>

      {onAdd && (   // ✅ prevents + button in other columns
        <button
          onClick={onAdd}
          className="h-6 w-6 grid place-items-center rounded-full hover:bg-white/20 text-lg leading-none"
        >
          +
        </button>
      )}
    </div>
  );
}