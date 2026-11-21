
export default function PageHeading({ title, description, action, actions }) {
  const headingActions = actions ?? action;

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1 max-w-xl text-sm text-muted">
            {description}
          </p>
        )}
      </div>

      {headingActions && (
        <div className="flex items-center gap-2">
          {headingActions}
        </div>
      )}
    </div>
  );
}
