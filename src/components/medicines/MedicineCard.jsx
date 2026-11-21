
import { Pencil, Trash2 } from "lucide-react";

import { PriorityBadge, StockBadge } from "../shared/Badges.jsx";
import StockIndicator from "../shared/StockIndicator.jsx";
import { IconButton } from "../shared/Button.jsx";

export default function MedicineCard({
  medicine,
  onEdit,
  onDelete,
}) {
  const m = medicine;

  const isSyrup = String(m.form || "")
    .toLowerCase()
    .includes("syrup");

  const stock = Math.max(0, Number(m.stock) || 0);

  const dailyUsage = Math.max(
    0,
    Number(m.dailyConsumption) || 0
  );

  const daysLeft =
    dailyUsage > 0
      ? Math.floor(stock / dailyUsage)
      : null;

  const stockStatus = isSyrup
    ? "healthy"
    : stock <= 0
      ? "out"
      : dailyUsage <= 0
        ? "healthy"
        : daysLeft <= 4
          ? "critical"
          : daysLeft <= 8
            ? "low"
            : "healthy";

  const stockPercentage =
    dailyUsage > 0
      ? Math.min(
          (stock / (dailyUsage * 60)) * 100,
          100
        )
      : 0;

  return (
    <article className="flex flex-col rounded-lg border border-line bg-surface p-4 shadow-card transition-colors hover:border-muted/40">

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-medium">
            {m.name}{" "}
            <span className="font-normal text-muted">
              {m.strength}
            </span>
          </h3>

          <p className="mt-0.5 text-xs text-muted">
            {m.form}
          </p>
        </div>

        <PriorityBadge priority={m.priority} />
      </header>

      {!isSyrup && (
        <StockIndicator
          className="mt-4"
          stock={stock}
          unit="units"
          pct={stockPercentage}
          status={stockStatus}
        />
      )}

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">

        <div>
          <dt className="text-muted">Daily use</dt>
          <dd className="mt-0.5 font-medium">
            {isSyrup
              ? "Not tracked"
              : dailyUsage > 0
                ? `${dailyUsage} units`
                : "Not scheduled"}
          </dd>
        </div>

        {!isSyrup && (
          <div>
            <dt className="text-muted">Days left</dt>
            <dd className="mt-0.5 font-medium">
              {daysLeft === null ? "—" : `${daysLeft} days`}
            </dd>
          </div>
        )}

        <div className="flex items-end justify-end">
          {!isSyrup && (
            <StockBadge status={stockStatus} />
          )}
        </div>

      </dl>

      <footer className="mt-4 flex items-center justify-end">
        <div className="flex">
          <IconButton
            icon={Pencil}
            label={`Edit ${m.name} ${m.strength}`}
            onClick={() => onEdit?.(m)}
          />

          <IconButton
            icon={Trash2}
            label={`Delete ${m.name} ${m.strength}`}
            onClick={() => onDelete?.(m.id)}
            className="hover:!text-crit"
          />
        </div>
      </footer>

    </article>
  );
}
