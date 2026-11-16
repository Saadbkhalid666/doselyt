import { Pencil, Trash2, Check } from 'lucide-react';
import { PriorityBadge, StockBadge } from '../shared/Badges.jsx';
import StockIndicator from '../shared/StockIndicator.jsx';
import Button, { IconButton } from '../shared/Button.jsx';

export default function MedicineCard({ medicine, onEdit, onDelete, onTaken }) {
  const m = medicine;
  return (
    <article className="flex flex-col rounded-lg border border-line bg-surface p-4 shadow-card transition-colors hover:border-muted/40">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-medium">{m.name} <span className="font-normal text-muted">{m.strength}</span></h3>
          <p className="mt-0.5 text-xs text-muted">{m.form}</p>
        </div>
        <PriorityBadge priority={m.priority} />
      </header>

      <StockIndicator className="mt-4" stock={m.stock} unit={m.unit} pct={m.stockPct} status={m.stockStatus} />

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">
        <div><dt className="text-muted">Daily use</dt><dd className="mt-0.5 font-medium">{m.dailyConsumption} / day</dd></div>
        <div><dt className="text-muted">Days left</dt><dd className="mt-0.5 font-medium">{m.daysRemaining} days</dd></div>
        <div className="flex items-end justify-end"><StockBadge status={m.stockStatus} /></div>
      </dl>

      <footer className="mt-4 flex items-center justify-between">
        {onTaken ? <Button size="sm" icon={Check} onClick={() => onTaken(m)}>Log dose</Button> : <span />}
        <div className="flex">
          <IconButton icon={Pencil} label={`Edit ${m.name} ${m.strength}`} onClick={() => onEdit?.(m)} />
          <IconButton icon={Trash2} label={`Delete ${m.name} ${m.strength}`} onClick={() => onDelete?.(m)} className="hover:!text-crit" />
        </div>
      </footer>
    </article>
  );
}
