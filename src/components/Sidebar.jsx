import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineSearch,
  HiOutlineStar,
  HiOutlineSupport,
  HiOutlineDatabase,
  HiOutlineChartBar,
  HiOutlineCreditCard,
} from "react-icons/hi";

const navItems = [
  { label: "Home", to: "/", icon: HiOutlineHome, count: null },
  { label: "Tasks", to: "/faculty-dashboard", icon: HiOutlineClipboardList, count: null },
  { label: "Analytics", to: "/analytics", icon: HiOutlineChartBar },
  { label: "Help & Support", to: "/help", icon: HiOutlineSupport, count: null },
];
export default function Sidebar({ userName = "Faculty User", userRole = "Member" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
     navigate("/login"); // better than href
  };

  return (
    <aside
      className="w-64 shrink-0 flex flex-col rounded-3xl m-3 p-5 text-white"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.55 0.22 282) 0%, oklch(0.48 0.23 285) 100%)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-white text-[color:var(--brand)] grid place-items-center font-bold text-lg">
          TNX
        </div>
        <span className="font-semibold text-lg tracking-tight">
          TaskNexus
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-white/10 placeholder:text-white/60 text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none focus:bg-white/15"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          // Better active check (handles nested routes too)
          const active =
            item.to === "/"
              ? pathname === "/"
              : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                ? "bg-white text-[color:var(--brand-deep)] shadow-sm"
                : "text-white/85 hover:bg-white/10 hover:pl-4"
                }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="text-lg" />
                {item.label}
              </span>

              {item.count != null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${active
                    ? "bg-[color:var(--brand-soft)] text-[color:var(--brand-deep)]"
                    : "bg-white/15 text-white"
                    }`}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Go Pro */}
      <div className="mt-4 mb-3 rounded-2xl bg-white/10 p-3 flex items-center justify-between">
        <span className="text-sm font-medium">Go Pro</span>
        <HiOutlineStar className="text-yellow-300" />
      </div>

      {/* User */}
      <div className="border-t border-white/15 pt-3 flex items-center gap-3">



        <button
          onClick={handleLogout}
          className="text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10 transition"
        >
          <HiOutlineLogout />
        </button>
      </div>
    </aside>
  );
}
