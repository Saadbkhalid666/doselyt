
import { Pencil, Trash2, Check } from 'lucide-react';
import { PriorityBadge, StockBadge } from '../shared/Badges.jsx';
import StockIndicator from '../shared/StockIndicator.jsx';
import Button, { IconButton } from '../shared/Button.jsx';

export default function MedicineCard({
  medicine,
  onEdit,
  onDelete,
  onTaken
}) {
  const m = medicine;

  const stock = Number(m.stock) || 0;
  const quantityPerAdministration =
    Number(m.quantityPerAdministration) || 0;

  const administrationsPerDay =
    m.scheduledTimes?.length || 1;

  const dailyUsage =
    quantityPerAdministration * administrationsPerDay;

  const dailyUsageForSyrups = m.frequency;
  const daysLeft = dailyUsage > 0
    ? Math.floor(stock / dailyUsage)
    : 0;

  // Determine stock status using remaining days.
  const stockStatus =
    stock <= 0
      ? 'out'
      : daysLeft <= 4
        ? 'critical'
        : daysLeft <= 8
          ? 'low'
          : 'healthy';

  // Progress relative to a 30-day supply.
  const stockPercentage = dailyUsage > 0
    ? Math.min((stock / (dailyUsage * 60)) * 100, 100)
    : 0;

  //checking the type of medicine
    const isSyrup =
      String(m.form || "")
        .toLowerCase()
        .includes("syrup");
  

  return (
    <article className="flex flex-col rounded-lg border border-line bg-surface p-4 shadow-card transition-colors hover:border-muted/40">

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-medium">
            {m.name}{' '}
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
{isSyrup ? null :
      <StockIndicator
      className="mt-4"
      stock={stock}
      unit="units"
      pct={stockPercentage}
      status={stockStatus}
      />
    }

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">

        <div>
          <dt className="text-muted">Daily use</dt>
          <dd className="mt-0.5 font-medium">
            {isSyrup ? dailyUsageForSyrups : dailyUsage} {isSyrup ? null : 'units'}
          </dd>
        </div>
{isSyrup ?  null : 
        <div>
          <dt className="text-muted">Days left</dt>
          <dd className="mt-0.5 font-medium">
            {daysLeft} days
          </dd>
        </div>
}

        <div className="flex items-end justify-end">
        {isSyrup ?  null : <StockBadge status={stockStatus} />}
        </div>

      </dl>

      <footer className="mt-4 flex items-center justify-between">
       
        {onTaken && !isSyrup  ? (
          <Button
            size="sm"
            icon={Check}
            onClick={() => onTaken(m.id)}
          >
            Log dose
          </Button>
        ) : (
          <span />
        )}

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
