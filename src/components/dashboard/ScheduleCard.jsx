import { Clock, Check, Package, Repeat, CalendarClock } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../shared/Badges.jsx';
import Button from '../shared/Button.jsx';
import { StockBar, TONES, getTone } from '../shared/StockBar.jsx';

// Accent strip + card edge per status.
const STATUS = {
  due: { strip: 'bg-indigo-500', edge: 'border-indigo-500/50 ring-1 ring-indigo-500/20', time: 'bg-indigo-500 text-white' },
  missed: { strip: 'bg-rose-500', edge: 'border-rose-500/30', time: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  taken: { strip: 'bg-emerald-500', edge: 'opacity-75', time: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
};
const DEFAULT = { strip: 'bg-slate-300 dark:bg-slate-600', edge: '', time: 'bg-subtle text-muted' };

export default function ScheduleCard({ item, onTaken }) {
  const done = item.status === 'taken';
  const look = STATUS[item.status] || DEFAULT;
  const hasStock = item.stock !== null && item.stock !== undefined;
  const quantity = Number(item.quantity) || 0;
  // Low-stock hint based on how many administrations are left.
  const dosesLeft = hasStock && quantity > 0 ? Math.floor(Number(item.stock) / quantity) : null;
  const stockTone = dosesLeft == null ? 'text-muted' : dosesLeft < 1 ? TONES.crit.text : dosesLeft <= 3 ? TONES.warn.text : 'text-muted';
  const hasDays = typeof item.daysLeft === 'number';
  const daysTone = TONES[getTone(item.daysLeft)];

  return (
    <article className={`relative overflow-hidden rounded-2xl border border-line bg-surface p-4 pl-5 shadow-card transition-colors ${look.edge}`}>
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${look.strip}`} />

      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold ${look.time}`}>
          <Clock className="h-3.5 w-3.5" />{item.displayTime || item.time}
        </span>
        <StatusBadge status={item.status} />
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="truncate text-[15px] font-semibold">{item.name} <span className="font-normal text-muted">{item.strength}</span></h4>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-subtle px-2.5 py-1 font-medium ring-1 ring-inset ring-line">Take {item.quantity}</span>
            {hasStock && (
              <span className={`inline-flex items-center gap-1 ${stockTone}`}>
                <Package className="h-3 w-3" />{item.stock} left
              </span>
            )}
            {item.frequency === 'alternate' && (
              <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400"><CalendarClock className="h-3 w-3" />Alternate days</span>
            )}
            {item.frequency === 'daily' && (
              <span className="inline-flex items-center gap-1 text-muted"><Repeat className="h-3 w-3" />Daily</span>
            )}
          </div>
        </div>
        <PriorityBadge priority={item.priority} />
      </div>

      {hasDays && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted">Stock coverage</span>
            <span className={`font-medium ${daysTone.text}`}>{item.daysLeft} days</span>
          </div>
          <StockBar days={item.daysLeft} size="sm" />
        </div>
      )}

      <div className="mt-4">
        {done
          ? <Button size="sm" className="w-full" disabled icon={Check}>Taken</Button>
          : <Button size="md" variant="accent" className="w-full" icon={Check} onClick={() => onTaken?.(item)}>Mark as Taken</Button>}
      </div>
    </article>
  );
}
