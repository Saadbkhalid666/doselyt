import { CalendarClock, Repeat, Zap } from "lucide-react";
import { getFrequency, getFrequencyLabel } from "../../utils/frequency";

const STYLES = {
  daily: { icon: Repeat, cls: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" },
  alternate: { icon: CalendarClock, cls: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  asNeeded: { icon: Zap, cls: "bg-teal-500/10 text-teal-700 dark:text-teal-300" },
};

export default function FrequencyBadge({ medicine }) {
  const style = STYLES[getFrequency(medicine)] || STYLES.daily;
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style.cls}`}>
      <Icon className="h-3 w-3" />
      {getFrequencyLabel(medicine)}
    </span>
  );
}
