import { Sunrise, Sun, Sunset, Moon } from 'lucide-react';
import ScheduleCard from './ScheduleCard.jsx';

const icons = { morning: Sunrise, afternoon: Sun, evening: Sunset, night: Moon };

export default function ScheduleSection({ groups, onTaken }) {
  return (
    <section>
      <h2 className="mb-4 text-base font-semibold tracking-tight">Today's schedule</h2>
      <div className="space-y-7">
        {groups.map((g) => {
          const Icon = icons[g.period];
          return (
            <div key={g.period}>
              <div className="mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted" strokeWidth={1.75} />
                <h3 className="text-sm font-medium">{g.label}</h3>
                <span className="text-xs text-muted">{g.range}</span>
                <span className="ml-auto rounded bg-subtle px-1.5 py-0.5 text-xs text-muted">{g.items.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {g.items.map((item) => <ScheduleCard key={item.id} item={item} onTaken={onTaken} />)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
