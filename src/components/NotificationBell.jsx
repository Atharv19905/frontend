import { useState } from "react";
import { HiOutlineBell } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBell({ notifications = [], markRead }) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative h-10 w-10 grid place-items-center rounded-full hover:bg-[color:var(--surface-muted)]">
        <HiOutlineBell className="text-xl text-[color:var(--ink-muted)]" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 text-[10px] font-bold bg-rose-500 text-white rounded-full grid place-items-center">
            {unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-panel border border-[color:var(--border)] z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[color:var(--border-soft)] font-semibold">Notifications</div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && <p className="p-4 text-sm text-[color:var(--ink-soft)]">No notifications</p>}
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead?.(n.id)}
                  className={`w-full text-left px-4 py-3 text-sm border-b border-[color:var(--border-soft)] hover:bg-[color:var(--surface-muted)] ${!n.read ? "bg-[color:var(--brand-soft)]" : ""
                    }`}
                >
                  {n.message || n.text || "New notification"}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
