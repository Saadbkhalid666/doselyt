import { Pencil, Trash2 } from 'lucide-react';
import { PriorityBadge, StockBadge, stockTone } from '../shared/Badges.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';
import { IconButton } from '../shared/Button.jsx';

const th = 'px-4 py-2.5 text-left text-xs font-medium text-muted';

export default function MedicineTable({ medicines, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-card">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="border-b border-line bg-subtle/50">
          <tr>
            <th className={th}>Medicine</th><th className={th}>Priority</th><th className={`${th} w-48`}>Stock</th>
            <th className={th}>Daily use</th><th className={th}>Days left</th><th className={th}>Status</th><th className={th} />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {medicines.map((m) => (
            <tr key={m.id} className="transition-colors hover:bg-subtle/50">
              <td className="px-4 py-3">
                <div className="font-medium">{m.name} <span className="font-normal text-muted">{m.strength}</span></div>
                <div className="text-xs text-muted">{m.form}</div>
              </td>
              <td className="px-4 py-3"><PriorityBadge priority={m.priority} /></td>
              <td className="px-4 py-3">
                <div className="mb-1.5 text-xs font-medium">{m.stock} <span className="font-normal text-muted">{m.unit}</span></div>
                <ProgressBar value={m.stockPct} tone={stockTone[m.stockStatus]} />
              </td>
              <td className="px-4 py-3 text-muted">{m.dailyConsumption} / day</td>
              <td className="px-4 py-3 font-medium">{m.daysRemaining} days</td>
              <td className="px-4 py-3"><StockBadge status={m.stockStatus} /></td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <IconButton icon={Pencil} label={`Edit ${m.name}`} onClick={() => onEdit?.(m)} />
                  <IconButton icon={Trash2} label={`Delete ${m.name}`} onClick={() => onDelete?.(m)} className="hover:!text-crit" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
