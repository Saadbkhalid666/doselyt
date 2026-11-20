import { Clock, Check } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../shared/Badges.jsx';
import Button from '../shared/Button.jsx';

const edge = { due: 'border-accent/60 ring-1 ring-accent/30', missed: 'border-crit/30', taken: 'opacity-75' };

export default function ScheduleCard({ item, onTaken }) {
  const done = item.status === 'taken';
  return (
    <article className={`rounded-lg border border-line bg-surface p-4 shadow-card transition-colors ${edge[item.status] || ''}`}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium"><Clock className="h-3.5 w-3.5 text-muted" />{item.time}</span>
        <StatusBadge status={item.status} />
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="truncate text-[15px] font-medium">{item.name} <span className="font-normal text-muted">{item.strength}</span></h4>
          <p className="mt-0.5 text-xs text-muted">
  Take {item.quantity}
  {item.stock !== null && item.stock !== undefined
    ? ` · ${item.stock} left`
    : ""}
</p>
        </div>
        <PriorityBadge priority={item.priority} />
      </div>
      <div className="mt-4">
        {done
          ? <Button size="sm" className="w-full" disabled icon={Check}>Taken</Button>
          : <Button size="md" variant="accent" className="w-full" icon={Check} onClick={() => onTaken?.(item)}>Mark as Taken</Button>}
      </div>
    </article>
  );
}
