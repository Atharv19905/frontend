import StatusPill from "./StatusPill";
import TaskCard from "./TaskCard";

export default function KanbanColumn({ label, variant, tasks = [], onAdd, onCardClick, refresh }) {
  return (
    <div className="flex-1 min-w-[280px] flex flex-col gap-3">
      <StatusPill count={tasks.length} label={label} variant={variant} onAdd={onAdd} />
      <div className="space-y-3">
        {tasks.length === 0 && (
          <div className="text-center text-sm text-[color:var(--ink-soft)] py-8 border-2 border-dashed border-[color:var(--border)] rounded-2xl">
            No tasks
          </div>
        )}
        {tasks.map((t) => (
          <TaskCard key={t.id || t?.tasks?.id} task={t} onClick={() => onCardClick?.(t)} refresh={refresh} />
        ))}
      </div>
    </div>
  );
}
