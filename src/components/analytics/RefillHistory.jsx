import { PackageCheck } from 'lucide-react';
import EmptyState from '../shared/EmptyState.jsx';

export default function RefillHistory({ items = [] }) {
  return (
    <section className="rounded-lg border border-line bg-surface shadow-card">
      <header className="px-5 pt-5">
        <h3 className="text-sm font-medium">Refill history</h3>
        <p className="mt-0.5 text-xs text-muted">Recent restocks</p>
      </header>
      {items.length === 0 ? <div className="p-5"><EmptyState icon={PackageCheck} title="No refills recorded" /></div> : (
        <div className="overflow-x-auto p-2 pt-3">
          <table className="w-full min-w-[480px] text-sm">
            <tbody className="divide-y divide-line">
              {items.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2.5 text-muted">{r.date}</td>
                  <td className="px-3 py-2.5 font-medium">{r.medicine}</td>
                  <td className="px-3 py-2.5 text-muted">{r.quantity}</td>
                  <td className="hidden px-3 py-2.5 text-muted sm:table-cell">{r.source}</td>
                  <td className="px-3 py-2.5 text-right"><span className="rounded bg-ok/10 px-2 py-0.5 text-xs font-medium text-ok">{r.status}</span></td>
                </tr>
              ))}
            </tbody> 
          </table>
        </div>
      )}
    </section>
  );
}
