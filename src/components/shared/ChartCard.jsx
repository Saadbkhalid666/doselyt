export default function ChartCard({ title, description, actions, height = 260, children, className = '' }) {
  return (
    <section className={`rounded-lg border border-line bg-surface p-5 shadow-card ${className}`}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
        {actions}
      </header>
      <div style={{ height }}>{children}</div>
    </section>
  );
}

export function ChartTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="mb-1 font-medium text-ink">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-muted">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          {p.name}
          <span className="ml-auto pl-4 font-medium text-ink">{p.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}
