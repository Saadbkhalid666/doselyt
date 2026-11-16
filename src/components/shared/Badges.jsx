import { Check, Clock, BellRing, XCircle } from 'lucide-react';

const base = 'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap';

const statusMap = {
  upcoming: { label: 'Upcoming', cls: 'bg-subtle text-muted', icon: Clock },
  due: { label: 'Due now', cls: 'bg-accent/10 text-accent', icon: BellRing },
  taken: { label: 'Taken', cls: 'bg-ok/10 text-ok', icon: Check },
  missed: { label: 'Missed', cls: 'bg-crit/10 text-crit', icon: XCircle },
};
export function StatusBadge({ status }) {
  const { label, cls, icon: Icon } = statusMap[status] || statusMap.upcoming;
  return <span className={`${base} ${cls}`}><Icon className="h-3 w-3" strokeWidth={2} />{label}</span>;
}

// Priority is a neutral outline + colored dot, so it never competes with stock/status colors.
const priorityMap = {
  critical: { label: 'Critical', dot: 'bg-crit' },
  important: { label: 'Important', dot: 'bg-warn' },
  additional: { label: 'Additional', dot: 'bg-muted' },
};
export function PriorityBadge({ priority }) {
  const { label, dot } = priorityMap[priority] || priorityMap.additional;
  return (
    <span className={`${base} border border-line bg-surface text-ink`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{label}
    </span>
  );
}

export const stockTone = { healthy: 'accent', low: 'warn', critical: 'crit', out: 'crit' };
const stockMap = {
  healthy: { label: 'In stock', cls: 'bg-accent/10 text-accent' },
  low: { label: 'Low stock', cls: 'bg-warn/10 text-warn' },
  critical: { label: 'Critically low', cls: 'bg-crit/10 text-crit' },
  out: { label: 'Out of stock', cls: 'bg-crit/10 text-crit' },
};
export function StockBadge({ status }) {
  const { label, cls } = stockMap[status] || stockMap.healthy;
  return <span className={`${base} ${cls}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span>;
}
