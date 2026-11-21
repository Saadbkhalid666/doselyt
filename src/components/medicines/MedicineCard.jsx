import { CalendarClock, ClipboardCheck, Clock3, Package, Pencil, Pill, Trash2, Zap } from "lucide-react";
import { getDailyConsumption, getSchedule, getStockStatus, isSyrup } from "../../utils/medicine.js";
import { getDaysLeft, getNextDue, isAlternate, isAsNeeded } from "../../utils/frequency.js";
import { PriorityBadge, StockBadge } from "../shared/Badges.jsx";
import Button, { IconButton } from "../shared/Button.jsx";
import FrequencyBadge from "../shared/FrequencyBadge.jsx";
import { StockBar, DayTimeline, TONES, getTone } from "../shared/StockBar.jsx";

const PRIORITY = {
  critical: { strip: "bg-rose-500", tile: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  important: { strip: "bg-amber-500", tile: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  additional: { strip: "bg-sky-500", tile: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
};

export default function MedicineCard({ medicine, onEdit, onDelete, onLogDose }) {
  const syrup = isSyrup(medicine);
  const asNeeded = isAsNeeded(medicine);
  const alternate = isAlternate(medicine);
  const schedule = syrup || asNeeded ? [] : getSchedule(medicine);
  const daily = syrup || asNeeded ? 0 : getDailyConsumption(medicine);
  const days = getDaysLeft(medicine);
  const status = getStockStatus(medicine);
  const nextDue = getNextDue(medicine);
  const perUse = Number(medicine.perUse) || 0;
  const look = PRIORITY[medicine.priority] || PRIORITY.additional;
  const tone = TONES[getTone(days)];
  const needed = asNeeded ? perUse : daily;

  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-colors hover:border-indigo-500/40">
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${look.strip}`} />

      <div className="flex items-start justify-between gap-3 p-5 pb-0 pl-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${look.tile}`}>
            <Pill className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold leading-tight">{medicine.name}</h3>
            <p className="mt-0.5 truncate text-sm text-muted">{medicine.strength} · {medicine.form}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <IconButton icon={Pencil} label={`Edit ${medicine.name}`} onClick={() => onEdit?.(medicine)} />
          <IconButton icon={Trash2} label={`Delete ${medicine.name}`} className="hover:!text-crit" onClick={() => onDelete?.(medicine)} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 px-5 pl-6">
        <PriorityBadge priority={medicine.priority} />
        {!syrup && <FrequencyBadge medicine={medicine} />}
        {!syrup && !asNeeded && <StockBadge status={status} />}
      </div>

      {syrup ? (
        <div className="m-5 ml-6 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
          Syrup stock and schedule are not tracked in this version.
        </div>
      ) : (
        <div className="space-y-5 p-5 pl-6">
          {asNeeded ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-subtle/60 px-3 py-2.5">
                  <p className="text-xs text-muted">Per use</p>
                  <p className="mt-0.5 text-lg font-semibold leading-none">{perUse || "—"}</p>
                </div>
                <div className="rounded-xl bg-subtle/60 px-3 py-2.5">
                  <p className="flex items-center gap-1 text-xs text-muted"><Package className="h-3 w-3" /> In stock</p>
                  <p className="mt-0.5 text-lg font-semibold leading-none">{medicine.stock}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                Taken only when needed. There is no fixed schedule or days-left forecast.
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-subtle/60 px-3 py-2.5">
                  <p className="text-xs text-muted">{alternate ? "Per dose day" : "Per day"}</p>
                  <p className="mt-0.5 text-lg font-semibold leading-none">{daily}</p>
                </div>
                <div className="rounded-xl bg-subtle/60 px-3 py-2.5">
                  <p className="flex items-center gap-1 text-xs text-muted"><Package className="h-3 w-3" /> In stock</p>
                  <p className="mt-0.5 text-lg font-semibold leading-none">{medicine.stock}</p>
                </div>
                <div className="rounded-xl bg-subtle/60 px-3 py-2.5">
                  <p className="text-xs text-muted">Days left</p>
                  <p className={`mt-0.5 text-lg font-semibold leading-none ${tone.text}`}>{days == null ? "—" : days}</p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted">Stock coverage</span>
                  <span className={`font-medium ${tone.text}`}>{days == null ? "No forecast" : `${days} of 30 days shown`}</span>
                </div>
                <StockBar days={days} />
              </div>

              {alternate && nextDue && (
                <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${nextDue.due ? "bg-violet-500/10 text-violet-700 dark:text-violet-300" : "bg-subtle/60 text-muted"}`}>
                  <CalendarClock className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{nextDue.label}</span>
                  <span className="ml-auto text-xs opacity-80">every other day</span>
                </div>
              )}

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Clock3 className="h-4 w-4 text-muted" /> Administration schedule
                </div>
                <DayTimeline schedule={schedule} />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {schedule.map((entry) => (
                    <span key={entry.time} className="inline-flex items-center gap-1.5 rounded-full bg-subtle/70 px-2.5 py-1 text-xs ring-1 ring-inset ring-line">
                      <span className="font-medium">{entry.time}</span>
                      <span className="text-muted">{entry.quantity} per administration</span>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {onLogDose && (
            <Button
              className="w-full"
              variant="accent"
              icon={ClipboardCheck}
              disabled={needed <= 0 || Number(medicine.stock) < needed}
              onClick={() => onLogDose(medicine)}
            >
              {asNeeded ? "Log dose taken" : "Log dose"}
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
