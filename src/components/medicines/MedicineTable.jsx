import { getDailyConsumption, getStockStatus, isSyrup } from "../../utils/medicine.js";
import { getDaysLeft, isAlternate, isAsNeeded } from "../../utils/frequency.js";
import FrequencyBadge from "../shared/FrequencyBadge.jsx";
import { PriorityBadge, StockBadge } from "../shared/Badges.jsx";
import { IconButton } from "../shared/Button.jsx";
import { StockBar, TONES, getTone } from "../shared/StockBar.jsx";
import { Pencil, Pill, Trash2 } from "lucide-react";

const TILE = {
  critical: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  important: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  additional: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

export default function MedicineTable({ medicines = [], onEdit, onDelete }) {
  if (!medicines.length) return <p className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">No medicines found.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="border-b border-line bg-subtle/50 text-xs font-medium text-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Medicine</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Frequency</th>
            <th className="px-4 py-3 font-medium">Daily use</th>
            <th className="px-4 py-3 font-medium">Stock</th>
            <th className="w-56 px-4 py-3 font-medium">Days left</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-5 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {medicines.map((medicine) => {
            const syrup = isSyrup(medicine);
            const asNeeded = isAsNeeded(medicine);
            const days = syrup ? null : getDaysLeft(medicine);
            const tone = TONES[getTone(days)];
            return (
              <tr key={medicine.id} className="transition-colors hover:bg-subtle/40">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${TILE[medicine.priority] || TILE.additional}`}>
                      <Pill className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{medicine.name}</p>
                      <p className="text-xs text-muted">{medicine.strength} · {medicine.form}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5"><PriorityBadge priority={medicine.priority} /></td>
                <td className="px-4 py-3.5">{syrup ? "—" : <FrequencyBadge medicine={medicine} />}</td>
                <td className="px-4 py-3.5 tabular-nums">{syrup || asNeeded ? "—" : isAlternate(medicine) ? `${getDailyConsumption(medicine)} / 2 days` : getDailyConsumption(medicine)}</td>
                <td className="px-4 py-3.5 tabular-nums">{syrup ? <span className="text-muted">Not tracked</span> : medicine.stock}</td>
                <td className="px-4 py-3.5">
                  {syrup || asNeeded ? <span className="text-muted">{asNeeded ? "No forecast" : "—"}</span> : (
                    <div className="flex items-center gap-3">
                      <StockBar days={days} size="sm" />
                      <span className={`w-9 shrink-0 text-right text-xs font-semibold tabular-nums ${tone.text}`}>{days ?? "—"}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5">{!syrup && !asNeeded && <StockBadge status={getStockStatus(medicine)} />}</td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1">
                    <IconButton icon={Pencil} label={`Edit ${medicine.name}`} onClick={() => onEdit?.(medicine)} />
                    <IconButton icon={Trash2} label={`Delete ${medicine.name}`} className="hover:!text-crit" onClick={() => onDelete?.(medicine)} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
