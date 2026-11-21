// Shared visual helpers used by cards, table and dose cards.
// Purely presentational: they only receive numbers via props.

export const TONES = {
  ok: {
    fill: "from-emerald-400 to-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    soft: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    label: "Healthy",
  },
  warn: {
    fill: "from-amber-300 to-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    soft: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    label: "Running low",
  },
  crit: {
    fill: "from-rose-400 to-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    soft: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
    label: "Critical",
  },
  none: {
    fill: "from-slate-300 to-slate-400",
    text: "text-muted",
    soft: "bg-subtle text-muted",
    dot: "bg-slate-400",
    label: "No data",
  },
};

// <= 7 days critical, <= 14 days low, otherwise healthy. Tweak here to change every bar.
export const getTone = (days) => {
  if (days == null || Number.isNaN(days)) return "none";
  if (days <= 7) return "crit";
  if (days <= 14) return "warn";
  return "ok";
};

export function StockBar({ days, max = 30, size = "md" }) {
  const tone = TONES[getTone(days)];
  const pct = days == null ? 0 : Math.min(100, Math.max(days > 0 ? 4 : 0, (days / max) * 100));
  return (
    <div
      role="progressbar"
      aria-label="Days of stock remaining"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={days ?? 0}
      className={`relative w-full overflow-hidden rounded-full bg-subtle ${size === "sm" ? "h-1.5" : "h-2.5"}`}
    >
      <div
        className={`h-full rounded-full bg-gradient-to-r ${tone.fill} transition-[width] duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const toMinutes = (time) => {
  const [h, m] = String(time).split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};

// A 24-hour bar with a marker at every scheduled administration time.
export function DayTimeline({ schedule = [] }) {
  return (
    <div>
      <div className="relative h-7 rounded-full bg-gradient-to-r from-indigo-500/10 via-amber-300/20 to-indigo-500/10 ring-1 ring-inset ring-line">
        {schedule.map((entry, index) => {
          const minutes = toMinutes(entry.time);
          if (minutes == null) return null;
          const left = Math.min(96, Math.max(4, (minutes / 1440) * 100));
          return (
            <span
              key={`${entry.time}-${index}`}
              title={`${entry.time} · ${entry.quantity} per administration`}
              className="absolute top-1/2 grid h-5 min-w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-indigo-500 px-1 text-[10px] font-semibold leading-none text-white shadow ring-2 ring-surface"
              style={{ left: `${left}%` }}
            >
              {entry.quantity}
            </span>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between px-1 text-[10px] text-muted">
        <span>12 am</span>
        <span>6 am</span>
        <span>12 pm</span>
        <span>6 pm</span>
        <span>12 am</span>
      </div>
    </div>
  );
}

export default StockBar;
