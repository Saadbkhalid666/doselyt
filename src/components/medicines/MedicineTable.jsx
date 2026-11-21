
import { Pencil, Trash2 } from "lucide-react";

import {
  PriorityBadge,
  StockBadge,
  stockTone,
} from "../shared/Badges.jsx";

import ProgressBar from "../shared/ProgressBar.jsx";
import { IconButton } from "../shared/Button.jsx";

const th = "px-4 py-2.5 text-left text-xs font-medium text-muted";

export default function MedicineTable({
  medicines,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-card">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="border-b border-line bg-subtle/50">
          <tr>
            <th className={th}>Medicine</th>
            <th className={th}>Priority</th>
            <th className={`${th} w-48`}>Stock</th>
            <th className={th}>Daily use</th>
            <th className={th}>Days left</th>
            <th className={th}>Status</th>
            <th className={th} />
          </tr>
        </thead>

        <tbody className="divide-y divide-line">
          {medicines.map((m) => {
            const isSyrup = String(m.form || "")
              .toLowerCase()
              .includes("syrup");

            return (
              <tr
                key={m.id}
                className="transition-colors hover:bg-subtle/50"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {m.name}{" "}
                    <span className="font-normal text-muted">
                      {m.strength}
                    </span>
                  </div>

                  <div className="text-xs text-muted">
                    {m.form}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <PriorityBadge priority={m.priority} />
                </td>

                <td className="px-4 py-3">
                  {isSyrup ? (
                    <span className="text-xs text-muted">
                      Not tracked
                    </span>
                  ) : (
                    <>
                      <div className="mb-1.5 text-xs font-medium">
                        {Number(m.stock) || 0}{" "}
                        <span className="font-normal text-muted">
                          units
                        </span>
                      </div>

                      <ProgressBar
                        value={m.stockPct || 0}
                        tone={stockTone[m.stockStatus] || "accent"}
                      />
                    </>
                  )}
                </td>

                <td className="px-4 py-3 text-muted">
                  {isSyrup
                    ? "Not tracked"
                    : m.dailyConsumption > 0
                      ? `${m.dailyConsumption} / day`
                      : "Not scheduled"}
                </td>

                <td className="px-4 py-3 font-medium">
                  {isSyrup || !m.dailyConsumption
                    ? "—"
                    : `${m.daysRemaining} days`}
                </td>

                <td className="px-4 py-3">
                  {!isSyrup && (
                    <StockBadge status={m.stockStatus} />
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <IconButton
                      icon={Pencil}
                      label={`Edit ${m.name}`}
                      onClick={() => onEdit?.(m)}
                    />

                    <IconButton
                      icon={Trash2}
                      label={`Delete ${m.name}`}
                      onClick={() => onDelete?.(m.id)}
                      className="hover:!text-crit"
                    />
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
