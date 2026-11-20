
import {
  Pencil,
  Trash2,
  Clock,
  TrendingDown,
  Check,
} from "lucide-react";

import { StockBadge } from "../shared/Badges.jsx";
import ProgressBar from "../shared/ProgressBar.jsx";
import Button, { IconButton } from "../shared/Button.jsx";

// Calculate inventory and remaining supply for a medicine.
function calculateMedicineStock(doseMedicine, inventory) {
  const medicine = inventory.find(
    (item) => item.id === doseMedicine.medicineId
  );

  if (!medicine) {
    return {
      ...doseMedicine,
      name: "Medicine unavailable",
      stock: 0,
      dailyUsage: 0,
      daysRemaining: 0,
      stockStatus: "Out of Stock",
      missing: true,
    };
  }

  const stock = Math.max(0, Number(medicine.stock) || 0);

  // Quantity required per administration.
  const quantity = Math.max(
    0,
    Number(doseMedicine.quantity) || 0
  );

  // Number of administrations per day.
  const administrationsPerDay =
    Array.isArray(doseMedicine.times) &&
    doseMedicine.times.length > 0
      ? doseMedicine.times.length
      : 1;

  const dailyUsage = quantity * administrationsPerDay;

  const daysRemaining =
    dailyUsage > 0
      ? Math.floor(stock / dailyUsage)
      : 0;

  let stockStatus;

  if (stock <= 0 || dailyUsage <= 0 || daysRemaining < 1) {
    stockStatus = "Out of Stock";
  } else if (daysRemaining < 3) {
    stockStatus = "Critical";
  } else if (daysRemaining < 5) {
    stockStatus = "Low Stock";
  } else {
    stockStatus = "In Stock";
  }

  return {
    ...doseMedicine,
    name: medicine.name,
    strength: medicine.strength,
    form: medicine.form,
    stock,
    dailyUsage,
    daysRemaining,
    stockStatus,
    missing: false,
  };
}

// Get progress bar tone.
function getProgressTone(daysRemaining) {
  if (daysRemaining < 3) return "crit";
  if (daysRemaining < 5) return "warn";
  return "accent";
}

export default function DoseCard({
  dose,
  medicines = [],
  onEdit,
  onDelete,
  onLogDose,
}) {
  if (!dose) return null;

  const doseMedicines = Array.isArray(dose.medicines)
    ? dose.medicines
    : [];

  const calculatedMedicines = doseMedicines.map((item) =>
    calculateMedicineStock(item, medicines)
  );

  // Medicine with the lowest remaining supply.
  const lowest = calculatedMedicines.length
    ? calculatedMedicines.reduce((previous, current) =>
        current.daysRemaining < previous.daysRemaining
          ? current
          : previous
      )
    : null;

  const totalMedicines = calculatedMedicines.length;

  const dailyAdministrations = calculatedMedicines.reduce(
    (total, medicine) =>
      total + (medicine.times?.length || 1),
    0
  );

  const availabilityDays = lowest?.daysRemaining ?? 0;

  const availability = lowest
    ? `${availabilityDays} ${
        availabilityDays === 1 ? "day" : "days"
      }`
    : "Not calculated";

  const availabilityPct = lowest
    ? Math.min(
        100,
        Math.max(0, (availabilityDays / 30) * 100)
      )
    : 0;

  const doseStatus = !lowest
    ? null
    : lowest.stockStatus;

  const tone = lowest
    ? getProgressTone(availabilityDays)
    : "accent";

  // Prevent logging if any medicine has insufficient stock.
  const canLogDose =
    calculatedMedicines.length > 0 &&
    calculatedMedicines.every(
      (medicine) =>
        !medicine.missing &&
        medicine.dailyUsage > 0 &&
        medicine.stock >= medicine.dailyUsage
    );

  return (
    <article className="flex flex-col rounded-lg border border-line bg-surface shadow-card">

      {/* Header */}
      <header className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight">
            {dose.name || "Untitled dose"}
          </h3>

          <p className="mt-0.5 text-sm text-muted">
            {totalMedicines} medicines · {dailyAdministrations} administrations a day
          </p>
        </div>

        <div className="-mr-1.5 flex shrink-0">
          <IconButton
            icon={Pencil}
            label={`Edit ${dose.name}`}
            onClick={() => onEdit?.(dose)}
          />

          <IconButton
            icon={Trash2}
            label={`Delete ${dose.name}`}
            onClick={() => onDelete?.(dose)}
            className="hover:!text-crit"
          />
        </div>
      </header>

      {/* Medicine List */}
      <ul className="divide-y divide-line border-y border-line">
        {calculatedMedicines.map((medicine, index) => (
          <li
            key={medicine.medicineId || index}
            className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {medicine.name}{" "}
                <span className="font-normal text-muted">
                  {medicine.strength}
                </span>
              </p>

              <p className="text-xs text-muted">
                {medicine.quantity} per administration ·{" "}
                {medicine.frequency || "Daily"}
              </p>

              <p className="mt-1 text-xs text-muted">
                Available stock: {medicine.stock}
              </p>

              <p className="mt-0.5 text-xs text-muted">
                {medicine.dailyUsage} units daily ·{" "}
                {medicine.daysRemaining} days remaining
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <Clock className="mr-0.5 h-3 w-3 text-muted" />

              {(medicine.times || []).map((time, i) => (
                <span
                  key={`${time}-${i}`}
                  className="rounded bg-subtle px-1.5 py-0.5 text-xs text-muted"
                >
                  {time}
                </span>
              ))}
            </div>
          </li>
        ))}

        {calculatedMedicines.length === 0 && (
          <li className="px-5 py-4 text-sm text-muted">
            No medicines added to this dose.
          </li>
        )}
      </ul>

      {/* Stock Summary */}
      <footer className="space-y-3 p-5 pt-4">

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs text-muted">
              Full regimen available for
            </span>

            <span className="text-sm font-semibold">
              {availability}
            </span>
          </div>

          <ProgressBar
            value={availabilityPct}
            tone={tone}
          />
        </div>

        {lowest && (
          <>
            <div className="flex items-center justify-between gap-2 rounded-md bg-subtle/60 px-3 py-2">
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <TrendingDown className="h-3.5 w-3.5" />
                Lowest stock
              </span>

              <span className="text-xs font-medium">
                {lowest.name} {lowest.strength}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted">
                Overall dose status
              </span>

              <StockBadge status={doseStatus} />
            </div>
          </>
        )}

        {/* Log Dose */}
        <div className="border-t border-line pt-3">
          <Button
            variant="primary"
            size="sm"
            icon={Check}
            onClick={() => onLogDose?.(dose)}
            disabled={!canLogDose}
            className="w-full"
          >
            Log Dose
          </Button>

          {!canLogDose && calculatedMedicines.length > 0 && (
            <p className="mt-2 text-center text-xs text-crit">
              Insufficient stock or invalid medicine quantity.
            </p>
          )}
        </div>

      </footer>
    </article>
  );
}
