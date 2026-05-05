"use client";

// In-app aviseringsfeed — drawer + slide-in toast vid nya händelser.
// Triggas via lib/notifications + localStorage. Klick på avisering markerar läst
// och navigerar (om link finns).
import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  useNotifications,
  markRead,
  markAllRead,
  type InAppNotification,
} from "@/lib/notifications";
import { Bell, X, Sparkles, Heart, Calendar, Snowflake, Info } from "lucide-react";
import { cn } from "@/lib/cn";

function iconFor(type: InAppNotification["type"]) {
  switch (type) {
    case "lesson-start": return Calendar;
    case "lesson-done": return Sparkles;
    case "streak-freeze": return Snowflake;
    case "hearts-refilled": return Heart;
    default: return Info;
  }
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just nu";
  if (mins < 60) return `${mins}m sedan`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h sedan`;
  const days = Math.floor(hrs / 24);
  return `${days}d sedan`;
}

export function NotificationFeed() {
  const { list, unread } = useNotifications();
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  // Slide-in toast: håll koll på senaste id vi visat så vi inte spammar samma flera gånger
  const [toast, setToast] = React.useState<InAppNotification | null>(null);
  const lastSeenIdRef = React.useRef<string | null>(null);
  const initRef = React.useRef(false);

  React.useEffect(() => {
    if (list.length === 0) return;
    const newest = list[0];
    // Vid första render: inga toasts — vi vill bara reagera på FRAMTIDA nya
    if (!initRef.current) {
      lastSeenIdRef.current = newest.id;
      initRef.current = true;
      return;
    }
    if (newest.id !== lastSeenIdRef.current) {
      lastSeenIdRef.current = newest.id;
      setToast(newest);
      const t = window.setTimeout(() => setToast(null), 4500);
      return () => window.clearTimeout(t);
    }
  }, [list]);

  function clickItem(n: InAppNotification) {
    markRead(n.id);
    setOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  }

  function clickToast() {
    if (!toast) return;
    clickItem(toast);
    setToast(null);
  }

  return (
    <>
      {/* Knapp i nav */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
        aria-label="Aviseringar"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[16px] h-4 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 px-1 text-[10px] font-bold text-white shadow-md">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
              className="fixed right-0 top-0 z-50 h-full w-full sm:w-[420px] glass-strong border-l border-white/10 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-violet-300" />
                  <h2 className="text-lg font-semibold">Aviseringar</h2>
                  {unread > 0 && (
                    <span className="rounded-full bg-rose-500/20 border border-rose-400/40 px-2 py-0.5 text-xs text-rose-200">
                      {unread} nya
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {list.length > 0 && unread > 0 && (
                    <button
                      onClick={() => markAllRead()}
                      className="text-xs text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-white/10"
                    >
                      Markera alla som lästa
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Stäng"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {list.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="text-5xl">🔕</div>
                    <p className="text-sm text-slate-400">
                      Inga aviseringar än. Du får ping när något händer — nya streak-skydd, hjärtan eller schemalagda lektioner.
                    </p>
                  </div>
                ) : (
                  list.map((n) => {
                    const Icon = iconFor(n.type);
                    return (
                      <button
                        key={n.id}
                        onClick={() => clickItem(n)}
                        className={cn(
                          "w-full text-left rounded-xl p-3 transition-all glass border-white/10 hover:border-white/20 hover:bg-white/5 flex items-start gap-3",
                          !n.read && "ring-1 ring-violet-400/40 bg-violet-500/5",
                        )}
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/30 to-cyan-400/30 text-violet-200 shrink-0">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{n.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{n.body}</div>
                          <div className="text-[10px] text-slate-500 mt-1">{timeAgo(n.ts)}</div>
                        </div>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-violet-400 mt-2 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Slide-in toast top-right vid ny avisering */}
      <AnimatePresence>
        {toast && (
          <motion.button
            initial={{ opacity: 0, x: 80, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.3 }}
            onClick={clickToast}
            className="fixed top-20 right-4 z-[60] max-w-[340px] glass-strong border border-white/15 rounded-2xl p-3 text-left shadow-xl flex items-start gap-3 hover:bg-white/10"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-white shrink-0">
              <Bell className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{toast.title}</div>
              <div className="text-xs text-slate-300 mt-0.5 line-clamp-2">{toast.body}</div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
