export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line px-6 py-12 text-center">
      {Icon && <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-subtle text-muted"><Icon className="h-5 w-5" strokeWidth={1.5} /></span>}
      <h3 className="text-sm font-medium">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
