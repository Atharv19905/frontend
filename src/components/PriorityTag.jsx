const map = {
  high: { label: "High Priority", cls: "bg-rose-50 text-rose-600" },
  medium: { label: "Important", cls: "bg-orange-50 text-orange-600" },
  low: { label: "Low Priority", cls: "bg-emerald-50 text-emerald-600" },
  meh: { label: "Meh", cls: "bg-yellow-50 text-yellow-700" },
  ok: { label: "OK", cls: "bg-amber-50 text-amber-600" },
  unknown: { label: "I don't know", cls: "bg-rose-50 text-rose-500" },
};

export default function PriorityTag({ priority = "medium", labelOverride }) {
  const v = map[priority] || map.medium;
  return (
    <span className={`inline-block text-[11px] font-semibold px-2 py-1 rounded-md ${v.cls}`}>
      {labelOverride || v.label}
    </span>
  );
}
