import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";

const TIMES = ["09:00", "09:30", "10:00", "11:00", "13:00", "14:00", "15:00", "16:30"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOffset(year: number, month: number) {
  // Monday-first offset
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

export default function BookingCalendar() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", notes: "" });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = startOffset(year, month);

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const canGoBack = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());

  const isPast = (day: number) => new Date(year, month, day) < today;
  const isWeekend = (day: number) => {
    const wd = new Date(year, month, day).getDay();
    return wd === 0 || wd === 6;
  };
  const isSelected = (day: number) =>
    !!selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-5xl overflow-hidden rounded-3xl border border-line bg-panel/70 text-left backdrop-blur">
      <div className="grid md:grid-cols-2">
        {/* Calendar */}
        <div className="border-b border-line-soft p-6 sm:p-8 md:border-b-0 md:border-r">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canGoBack}
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-cream-dim transition-colors hover:text-accent disabled:opacity-30"
            >
              ‹
            </button>
            <span className="text-sm font-medium tracking-tight text-cream">{monthLabel}</span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-cream-dim transition-colors hover:text-accent"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {DAY_LABELS.map((d) => (
              <span key={d} className="pb-2 text-[0.62rem] uppercase tracking-[0.18em] text-faint">
                {d}
              </span>
            ))}
            {Array.from({ length: offset }).map((_, i) => (
              <span key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isPast(day) || isWeekend(day);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSelected(new Date(year, month, day));
                    setTime(null);
                    setSent(false);
                  }}
                  className={cn(
                    "aspect-square rounded-full text-sm transition-all duration-200",
                    disabled
                      ? "cursor-not-allowed text-faint/50"
                      : "text-cream-dim hover:bg-accent/10 hover:text-accent",
                    isSelected(day) && "!bg-accent !text-white"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-faint">Times shown in your local timezone · 30 minutes</p>
        </div>

        {/* Times + details */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[280px] flex-col items-center justify-center text-center"
              >
                <span className="mb-3 text-2xl text-accent">◷</span>
                <p className="max-w-[16rem] text-sm text-cream-dim">
                  Pick a date to see available times for your free strategy call.
                </p>
              </motion.div>
            ) : sent ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex h-full min-h-[280px] flex-col items-center justify-center text-center"
              >
                <span className="mb-3 text-2xl text-accent">✓</span>
                <h3 className="text-xl font-medium text-cream">You're booked</h3>
                <p className="mt-2 max-w-[18rem] text-sm text-cream-dim">
                  {selected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {time}.
                  We'll send a confirmation to {form.email || "your inbox"}.
                </p>
              </motion.div>
            ) : (
              <motion.div key="pick" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h3 className="text-sm font-medium text-cream">
                  {selected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {TIMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTime(t)}
                      className={cn(
                        "rounded-full border border-line px-3 py-2 text-sm transition-all duration-200",
                        time === t ? "border-accent bg-accent text-white" : "text-cream-dim hover:border-accent/50 hover:text-accent"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {time && (
                  <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
                    <input
                      required
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="rounded-2xl border border-line bg-white/60 px-4 py-3 text-sm text-cream outline-none transition-colors placeholder:text-faint focus:border-accent"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Work email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="rounded-2xl border border-line bg-white/60 px-4 py-3 text-sm text-cream outline-none transition-colors placeholder:text-faint focus:border-accent"
                    />
                    <textarea
                      rows={2}
                      placeholder="What would you like help with?"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="resize-none rounded-2xl border border-line bg-white/60 px-4 py-3 text-sm text-cream outline-none transition-colors placeholder:text-faint focus:border-accent"
                    />
                    <button
                      type="submit"
                      className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-ink-2 transition-colors hover:bg-accent hover:text-white"
                    >
                      Confirm {time} call
                      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
