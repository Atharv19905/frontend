import {
  HiOutlineSearch,
  HiOutlineShare,
  HiOutlineUpload,
  HiPlus,
  HiSparkles,
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
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">

      {/* LEFT */}
      <div className="flex items-center gap-4">

        <div
          className="
            relative
            h-14
            w-14
            rounded-3xl
            bg-gradient-to-br
            from-[color:var(--brand)]/20
            via-indigo-100
            to-white
            border border-white/60
            flex items-center justify-center
            text-2xl
            shadow-lg shadow-indigo-100
            overflow-hidden
          "
        >
          <div className="absolute inset-0 bg-white/30 backdrop-blur-xl" />

          <span className="relative z-10">
            {emoji}
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">

            <h1
              className="
                text-3xl
                md:text-4xl
                font-black
                tracking-tight
                text-[color:var(--ink)]
                leading-none
              "
            >
              {title}
            </h1>

            <div
              className="
                hidden md:flex
                items-center
                gap-1
                px-2 py-1
                rounded-full
                bg-indigo-50
                border border-indigo-100
                text-[11px]
                font-semibold
                text-indigo-600
              "
            >
              <HiSparkles className="text-xs" />
              PRO
            </div>

          </div>

          <p
            className="
              text-sm
              text-[color:var(--ink-muted)]
              mt-1
              font-medium
              tracking-wide
            "
          >
            Manage, assign and track your academic workflow
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">

        {/* SEARCH */}
        <div className="relative flex-1 lg:w-[380px] group">

          {/* Glow */}
          <div
            className="
              absolute
              -inset-0.5
              rounded-3xl
              bg-gradient-to-r
              from-indigo-500/20
              via-violet-500/10
              to-cyan-500/20
              opacity-0
              blur
              transition-all duration-300
              group-focus-within:opacity-100
            "
          />

          <div
            className="
              relative
              flex
              items-center
              h-14
              rounded-3xl
              border border-white/60
              bg-white/75
              backdrop-blur-2xl
              shadow-lg
              shadow-slate-200/40
              transition-all duration-300
              group-focus-within:shadow-xl
              group-focus-within:scale-[1.01]
              group-focus-within:border-[color:var(--brand)]/20
            "
          >

            <div
              className="
                flex
                items-center
                justify-center
                h-10
                w-10
                rounded-2xl
                ml-2
                bg-gradient-to-br
                from-indigo-50
                to-violet-50
                text-[color:var(--brand)]
              "
            >
              <HiOutlineSearch className="text-lg" />
            </div>

            <input
              type="text"
              value={searchValue}
              onChange={(e) =>
                onSearchChange?.(e.target.value)
              }
              placeholder="Search #placement #exam #personal"
              className="
                flex-1
                h-full
                bg-transparent
                px-4
                text-sm
                font-medium
                text-[color:var(--ink)]
                placeholder:text-slate-400
                outline-none
              "
            />

            {searchValue && (
              <button
                onClick={() =>
                  onSearchChange?.("")
                }
                className="
                  mr-2
                  h-8
                  w-8
                  rounded-xl
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-600
                  transition-all
                "
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Tags */}
          {/* Search Tags */}
<div className="flex flex-wrap items-center gap-2 mt-2 px-1">

  {["#placement", "#exam", "#personal"].map(
    (tag) => (
      <button
        type="button"
        key={tag}
        onClick={() => {
          onSearchChange(tag);
        }}
        className="
          text-xs
          px-3
          py-1
          rounded-full
          bg-white
          border
          border-slate-200
          text-slate-500
          hover:border-indigo-200
          hover:text-indigo-600
          hover:bg-indigo-50
          transition-all
          cursor-pointer
        "
      >
        {tag}
      </button>
    )
  )}
</div>
        </div>

        {/* CUSTOM RIGHT */}
        {right}

        {/* ASSIGN BUTTON */}
        <button
          title="Assign Task"
          onClick={onAdd}
          className="
            relative
            overflow-hidden
            h-14
            px-6
            rounded-3xl
            bg-gradient-to-r
            from-[color:var(--brand)]
            via-indigo-600
            to-violet-600
            text-white
            font-semibold
            flex
            items-center
            justify-center
            gap-2
            shadow-xl
            shadow-indigo-500/25
            hover:scale-[1.03]
            hover:shadow-2xl
            transition-all duration-300
            whitespace-nowrap
          "
        >

          <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />

          <HiPlus className="text-lg relative z-10" />

          <span className="relative z-10">
            Assign Task
          </span>
        </button>
      </div>
    </div>
  );
}
