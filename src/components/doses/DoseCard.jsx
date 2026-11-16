import { Pencil, Trash2, Clock, TrendingDown } from 'lucide-react';
import { StockBadge, stockTone } from '../shared/Badges.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';
import { IconButton } from '../shared/Button.jsx';

export default function DoseCard({ dose, onEdit, onDelete }) {
  const d = dose;
  return (
    <article className="flex flex-col rounded-lg border border-line bg-surface shadow-card">
      <header className="flex items-start justify-between gap-3 p-5 pb-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight">{d.name}</h3>
          <p className="mt-0.5 text-sm text-muted">{d.totalMedicines} medicines · {d.dailyAdministrations} administrations a day</p>
        </div>
        <div className="-mr-1.5 flex">
          <IconButton icon={Pencil} label={`Edit ${d.name}`} onClick={() => onEdit?.(d)} />
          <IconButton icon={Trash2} label={`Delete ${d.name}`} onClick={() => onDelete?.(d)} className="hover:!text-crit" />
        </div>
      </header>

      <ul className="divide-y divide-line border-y border-line">
        {d.medicines.map((m) => (
          <li key={m.medicineId} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{m.name} <span className="font-normal text-muted">{m.strength}</span></p>
              <p className="text-xs text-muted">{m.quantity} · {m.frequency}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <Clock className="mr-0.5 h-3 w-3 text-muted" />
              {m.times.map((t) => <span key={t} className="rounded bg-subtle px-1.5 py-0.5 text-xs text-muted">{t}</span>)}
            </div>
          </li>
        ))}
      </ul>

      <footer className="space-y-3 p-5 pt-4">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-xs">
            <span className="text-muted">Full regimen available for</span>
            <span className="text-sm font-medium">{d.availability}</span>
          </div>
          <ProgressBar value={d.availabilityPct} tone={stockTone[d.lowest.stockStatus]} />
        </div>
        <div className="flex items-center justify-between gap-2 rounded-md bg-subtle/60 px-3 py-2 text-xs">
          <span className="flex items-center gap-1.5 text-muted"><TrendingDown className="h-3.5 w-3.5" />Lowest stock</span>
          <span className="flex items-center gap-2">
            <span className="font-medium">{d.lowest.name} {d.lowest.strength} · {d.lowest.daysRemaining} days</span>
            <StockBadge status={d.lowest.stockStatus} />
          </span>
        </div>
      </footer>
    </article>
  );
}
