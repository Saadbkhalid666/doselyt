import { Pill } from 'lucide-react';
import Button from '../shared/Button.jsx';

// Keyed by the dashboard's own stockStatus values (healthy / low / critical).
const TONE = {
  healthy: { fill: 'from-emerald-400 to-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  low: { fill: 'from-amber-300 to-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  critical: { fill: 'from-rose-400 to-rose-500', text: 'text-rose-600 dark:text-rose-400' },
};

export default function InventoryOverview({ medicines = [], onViewAll }) {
  return (
    <section className="rounded-2xl border border-line bg-surface shadow-card">
      <header className="flex items-center justify-between px-5 pt-5">
        <div>
          <h2 className="text-sm font-semibold">Inventory overview</h2>
          <p className="mt-0.5 text-xs text-muted">Lowest supply first</p>
        </div>
        <Button size="sm" variant="ghost" onClick={onViewAll}>View all</Button>
      </header>

      {medicines.length === 0 ? (
        <p className="m-5 rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">No tracked medicines yet.</p>
      ) : (
        <ul className="space-y-4 p-5 pt-4">
          {medicines.map((m) => {
            const noForecast = m.daysRemaining == null;
            const tone = TONE[m.stockStatus] || TONE.healthy;
            return (
              <li key={m.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-subtle text-muted"><Pill className="h-3.5 w-3.5" /></span>
                    <p className="truncate text-sm font-medium">{m.name} <span className="font-normal text-muted">{m.strength}</span></p>
                  </div>
                  <p className="shrink-0 text-xs tabular-nums">
                    <span className="text-muted">{m.stock} · </span>
                    <span className={`font-semibold ${noForecast ? 'text-muted' : tone.text}`}>
                      {noForecast ? (m.frequency === 'asNeeded' ? 'As needed' : '—') : `${m.daysRemaining}d`}
                    </span>
                  </p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-subtle">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ${noForecast ? 'bg-slate-300/70 dark:bg-slate-600/60' : `bg-gradient-to-r ${tone.fill}`}`}
                    style={{ width: `${Math.max(noForecast ? 100 : 4, m.stockPct ?? 0)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
