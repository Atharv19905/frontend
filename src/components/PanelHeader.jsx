import { HiOutlineSearch, HiOutlineShare, HiOutlineUpload, HiPlus } from "react-icons/hi";

export default function PanelHeader({ title, emoji, onShare, onAdd, onUpload, right }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--ink)] tracking-tight flex items-center gap-2">
        {title} {emoji && <span>{emoji}</span>}
      </h1>
      <div className="flex items-center gap-2">
        {right}
        <button className="h-10 w-10 grid place-items-center rounded-full hover:bg-[color:var(--surface-muted)] text-[color:var(--ink-muted)]">
          <HiOutlineSearch />
        </button>
        <button onClick={onAdd} className="h-10 w-10 grid place-items-center rounded-full bg-[color:var(--surface-muted)] text-[color:var(--ink-muted)] hover:bg-[color:var(--brand-soft)]">
          <HiPlus />
        </button>
      </div>
    </div>
  );
}
