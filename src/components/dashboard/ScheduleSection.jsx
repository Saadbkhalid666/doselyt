import { Sunrise, Sun, Sunset, Moon, CalendarCheck } from 'lucide-react';
import ScheduleCard from './ScheduleCard.jsx';

const PERIOD = {
  morning: { icon: Sunrise, tile: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  afternoon: { icon: Sun, tile: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  evening: { icon: Sunset, tile: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  night: { icon: Moon, tile: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
};

const count = (items, status) => items.filter((item) => item.status === status).length;

export default function ScheduleSection({ groups = [], onTaken }) {
  const all = groups.flatMap((g) => g.items);
  const total = all.length;
  const taken = count(all, 'taken');
  const missed = count(all, 'missed');
  const pct = (n) => (total ? (n / total) * 100 : 0);

  return (
    <section>
      <div className="mb-5 rounded-2xl border border-line bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Today's schedule</h2>
            <p className="mt-0.5 text-sm text-muted">
              {total === 0
                ? 'Nothing scheduled'
                : taken === total
                  ? 'All doses taken. Well done.'
                  : `${total - taken} left to take today`}
            </p>
          </div>
          <p className="text-2xl font-semibold leading-none tabular-nums">
            {taken}<span className="text-base font-normal text-muted"> / {total}</span>
          </p>
        </div>
        <div
          className="mt-4 flex h-2.5 w-full gap-1 overflow-hidden rounded-full bg-subtle"
          role="progressbar"
          aria-label="Doses taken today"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={taken}
        >
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-[width] duration-700" style={{ width: `${pct(taken)}%` }} />
          <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500 transition-[width] duration-700" style={{ width: `${pct(missed)}%` }} />
        </div>
        {total > 0 && (
          <div className="mt-3 flex gap-5 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Taken {taken}</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" />Upcoming {total - taken - missed}</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" />Missed {missed}</span>
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-line p-12 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><CalendarCheck className="h-6 w-6" /></span>
          <p className="mt-4 text-sm font-medium">No doses scheduled today</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Medicines with fixed times appear here. As-needed medicines are logged from My Medicines, and alternate-day medicines only show on their dose days.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => {
            const look = PERIOD[g.period];
            const Icon = look.icon;
            const done = count(g.items, 'taken');
            return (
              <div key={g.period}>
                <div className="mb-3 flex items-center gap-3">
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${look.tile}`}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold leading-tight">{g.label}</h3>
                    <p className="text-xs text-muted">{g.range}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-subtle">
                      <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-700" style={{ width: `${(done / g.items.length) * 100}%` }} />
                    </div>
                    <span className="text-xs tabular-nums text-muted">{done}/{g.items.length}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {g.items.map((item) => <ScheduleCard key={item.id} item={item} onTaken={onTaken} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
