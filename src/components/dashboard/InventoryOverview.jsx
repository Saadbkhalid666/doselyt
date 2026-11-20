import ProgressBar from '../shared/ProgressBar.jsx';
import { stockTone } from '../shared/Badges.jsx';
import Button from '../shared/Button.jsx';

export default function InventoryOverview({ medicines, onViewAll }) {
  return (
    <section className="rounded-lg border border-line bg-surface shadow-card">
      <header className="flex items-center justify-between px-5 pt-5">
        <h2 className="text-sm font-medium">Inventory overview</h2>
        <Button size="sm" variant="ghost" onClick={onViewAll}>View all</Button>
      </header>
      <ul className="space-y-3.5 p-5 pt-4">
        {medicines.map((m) => (
          <li key={m.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate">{m.name} <span className="text-muted">{m.strength}</span></span>
              <span className="shrink-0 text-xs text-muted">
  {m.stock} · {m.daysRemaining == null ? "—" : `${m.daysRemaining}d`}
</span>
            </div>
            <ProgressBar value={m.stockPct} tone={stockTone[m.stockStatus]} />
          </li>
        ))}
      </ul>
    </section>
  );
}
