export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-muted" strokeWidth={1.75} />}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}
