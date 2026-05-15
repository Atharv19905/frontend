import {
  HiOutlineSearch,
  HiOutlineShare,
  HiOutlineUpload,
  HiPlus,
} from "react-icons/hi";

export default function PanelHeader({
  title,
  emoji,
  onShare,
  onAdd,
  onUpload,
  right,
  searchValue,
  onSearchChange,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[color:var(--brand)]/15 to-[color:var(--brand)]/5 border border-[color:var(--brand)]/10 flex items-center justify-center text-xl shadow-sm">
          {emoji}
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--ink)] tracking-tight leading-tight">
            {title}
          </h1>

          <p className="text-sm text-[color:var(--ink-muted)] mt-0.5">
            Manage, assign and track your academic workflow
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 w-full lg:w-auto">

        {/* SEARCH */}
        <div className="relative flex-1 lg:flex-none lg:w-[320px]">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--ink-muted)] text-lg" />

          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search tags like #placement #personal"
            className="
              w-full h-11 pl-11 pr-4
              rounded-2xl
              border border-gray-200
              bg-white/80 backdrop-blur-xl
              shadow-sm
              focus:outline-none
              focus:ring-2
              focus:ring-[color:var(--brand)]/20
              focus:border-[color:var(--brand)]/30
              transition-all
              text-sm
            "
          />
        </div>

        {/* CUSTOM RIGHT */}
        {right}

        {/* ASSIGN BUTTON */}
        <button
          title="Assign Task"
          onClick={onAdd}
          className="
            h-11 px-5 rounded-2xl
            bg-gradient-to-r from-[color:var(--brand)] to-[color:var(--brand-dark,#4f46e5)]
            text-white font-medium
            flex items-center gap-2
            shadow-lg shadow-[color:var(--brand)]/20
            hover:scale-[1.03]
            hover:shadow-xl
            transition-all duration-200
            whitespace-nowrap
          "
        >
          <HiPlus className="text-lg" />
          Assign Task
        </button>
      </div>
    </div>
  );
}
