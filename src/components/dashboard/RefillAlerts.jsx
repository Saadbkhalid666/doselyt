import { PackageCheck } from 'lucide-react';
import ProgressBar from '../shared/ProgressBar.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import Button from '../shared/Button.jsx';

export default function RefillAlerts({ alerts = [], onRefill }) {
  return (
    <section className="rounded-lg border border-line bg-surface shadow-card">
      <header className="flex items-center justify-between px-5 pt-5">
        <h2 className="text-sm font-medium">Refill alerts</h2>
        {alerts.length > 0 && <span className="rounded bg-crit/10 px-1.5 py-0.5 text-xs font-medium text-crit">{alerts.length}</span>}
      </header>
      <div className="p-5 pt-4">
        {alerts.length === 0 ? (
          <EmptyState icon={PackageCheck} title="Nothing to refill" description="Every medicine is above your low-stock threshold." />
        ) : (
          <ul className="space-y-4">
            {alerts.map((a) => (
              <li key={a.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.name} <span className="font-normal text-muted">{a.strength}</span></p>
                    <p className="text-xs text-muted">{a.remaining} left · about {a.daysRemaining} days of supply</p>
                  </div>
                  <Button size="sm" onClick={() => onRefill?.(a)}>Refill</Button>
                </div>
                <ProgressBar className="mt-2" value={a.stockPct} tone={a.severity === 'critical' ? 'crit' : 'warn'} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
