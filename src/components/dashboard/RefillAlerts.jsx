import { AlertTriangle, PackageCheck, PackagePlus } from 'lucide-react';
import EmptyState from '../shared/EmptyState.jsx';
import Button from '../shared/Button.jsx';

const SEVERITY = {
  critical: { tile: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', fill: 'from-rose-400 to-rose-500', text: 'text-rose-600 dark:text-rose-400' },
  warn: { tile: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', fill: 'from-amber-300 to-amber-500', text: 'text-amber-600 dark:text-amber-400' },
};

export default function RefillAlerts({ alerts = [], onRefill }) {
  return (
    <section className="rounded-2xl border border-line bg-surface shadow-card">
      <header className="flex items-center justify-between px-5 pt-5">
        <div>
          <h2 className="text-sm font-semibold">Refill alerts</h2>
          <p className="mt-0.5 text-xs text-muted">Medicines running low</p>
        </div>
        {alerts.length > 0 && (
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-rose-500 px-1.5 text-xs font-semibold text-white">{alerts.length}</span>
        )}
      </header>
      <div className="p-5 pt-4">
        {alerts.length === 0 ? (
          <EmptyState icon={PackageCheck} title="Nothing to refill" description="Every medicine is above your low-stock threshold." />
        ) : (
          <ul className="space-y-3">
            {alerts.map((a) => {
              const look = SEVERITY[a.severity] || SEVERITY.warn;
              return (
                <li key={a.id} className="rounded-xl bg-subtle/50 p-3 ring-1 ring-inset ring-line/60">
                  <div className="flex items-start gap-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${look.tile}`}><AlertTriangle className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.name} <span className="font-normal text-muted">{a.strength}</span></p>
                      <p className="text-xs text-muted">
                        {a.remaining} left · <span className={`font-semibold ${look.text}`}>{a.daysRemaining} days</span> of supply
                      </p>
                    </div>
                    <Button size="sm" icon={PackagePlus} onClick={() => onRefill?.(a)}>Refill</Button>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-subtle">
                    <div className={`h-full rounded-full bg-gradient-to-r ${look.fill} transition-[width] duration-700`} style={{ width: `${Math.max(4, a.stockPct ?? 0)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
