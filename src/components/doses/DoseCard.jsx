import { Pencil, Trash2, ClipboardCheck, Layers, AlertTriangle } from "lucide-react";
import Button, { IconButton } from "../shared/Button.jsx";
import { StockBar, TONES, getTone } from "../shared/StockBar.jsx";
import { getSchedule, getDailyConsumption, isSyrup } from "../../utils/medicine.js";
import { getDaysLeft, isAsNeeded } from "../../utils/frequency.js";
import FrequencyBadge from "../shared/FrequencyBadge.jsx";

export default function DoseCard({ dose, medicines = [], onEdit, onDelete, onLogDose }) {
  const resolved = (dose.medicines || []).map((item) => {
    const id = typeof item === "string" ? item : item.medicineId || item.id;
    return medicines.find((medicine) => medicine.id === id) || null;
  });
  const available = resolved.filter(Boolean);
  const missing = resolved.length - available.length;
  const days = available.filter((medicine) => !isSyrup(medicine) && !isAsNeeded(medicine)).map(getDaysLeft).filter((value) => value != null);
  const regimenDays = days.length ? Math.min(...days) : null;
  const limiting = regimenDays == null
    ? null
    : available.find((medicine) => !isSyrup(medicine) && !isAsNeeded(medicine) && getDaysLeft(medicine) === regimenDays);
  const regimenTone = TONES[getTone(regimenDays)];

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="relative p-5 pb-4">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-indigo-500/10 to-transparent" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-500 text-white shadow-sm">
              <Layers className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold leading-tight">{dose.name}</h3>
              <p className="mt-0.5 text-xs text-muted">{available.length} medicines</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <IconButton icon={Pencil} label="Edit dose" onClick={() => onEdit?.(dose)} />
            <IconButton icon={Trash2} label="Delete dose" className="hover:!text-crit" onClick={() => onDelete?.(dose)} />
          </div>
        </div>
      </div>

      <ul className="flex-1 space-y-2.5 px-5">
        {available.map((medicine) => {
          const syrup = isSyrup(medicine);
          const asNeeded = isAsNeeded(medicine);
          const left = syrup || asNeeded ? null : getDaysLeft(medicine);
          const tone = TONES[getTone(left)];
          return (
            <li key={medicine.id} className="rounded-xl bg-subtle/50 p-3 ring-1 ring-inset ring-line/60">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium">
                  {medicine.name} <span className="font-normal text-muted">{medicine.strength}</span>
                </p>
                {!syrup && !asNeeded && <span className={`shrink-0 text-xs font-semibold tabular-nums ${tone.text}`}>{left == null ? "—" : `${left}d`}</span>}
              </div>
              {syrup ? (
                <p className="mt-1.5 text-xs text-muted">Syrup · stock not tracked</p>
              ) : asNeeded ? (
                <p className="mt-1.5 text-xs text-muted">As needed · not part of the daily log</p>
              ) : (
                <>
                  <div className="mt-2"><StockBar days={left} size="sm" /></div>
                  <div className="mt-2"><FrequencyBadge medicine={medicine} /></div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {getSchedule(medicine).map((entry) => (
                      <span key={entry.time} className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11px] ring-1 ring-inset ring-line">
                        <span className="font-medium">{entry.time}</span>
                        <span className="text-muted">{entry.quantity} per administration</span>
                      </span>
                    ))}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      {missing > 0 && (
        <p className="mx-5 mt-3 flex items-center gap-2 rounded-lg bg-crit/10 px-3 py-2 text-xs text-crit">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {missing} medicine reference(s) are no longer in My Medicines.
        </p>
      )}

      <div className="mt-4 border-t border-line bg-subtle/30 p-5">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Regimen stock coverage</p>
            <p className={`text-xl font-semibold leading-tight ${regimenTone.text}`}>{regimenDays == null ? "—" : `${regimenDays} days`}</p>
          </div>
          {limiting && <p className="max-w-[55%] truncate text-right text-xs text-muted">Limited by {limiting.name}</p>}
        </div>
        <StockBar days={regimenDays} />
        {onLogDose && (
          <Button className="mt-4 w-full" size="sm" variant="accent" icon={ClipboardCheck} onClick={() => onLogDose(dose)}>
            Log daily dose
          </Button>
        )}
      </div>
    </article>
  );
}
