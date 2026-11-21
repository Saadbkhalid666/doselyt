import { getDailyConsumption, getDaysRemaining } from "./medicine.js";

// medicine.frequency: "daily" (default, so old data keeps working) | "alternate" | "asNeeded"
export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Every day", hint: "Fixed times, every day" },
  { value: "alternate", label: "Alternate days", hint: "Fixed times, every other day" },
  { value: "asNeeded", label: "As needed", hint: "Only when required" },
];

export const getFrequency = (medicine) => medicine?.frequency || "daily";
export const isAsNeeded = (medicine) => getFrequency(medicine) === "asNeeded";
export const isAlternate = (medicine) => getFrequency(medicine) === "alternate";
export const getFrequencyLabel = (medicine) =>
  FREQUENCY_OPTIONS.find((option) => option.value === getFrequency(medicine))?.label || "Every day";

// Days of stock left, aware of frequency.
// As needed has no forecast; alternate days uses half the daily amount on average.
// If you later move this logic into getDaysRemaining in medicine.js, delete this and import that instead.
export const getDaysLeft = (medicine) => {
  if (isAsNeeded(medicine)) return null;
  if (isAlternate(medicine)) {
    const daily = Number(getDailyConsumption(medicine));
    const stock = Number(medicine.stock);
    if (!Number.isFinite(daily) || daily <= 0 || !Number.isFinite(stock)) return null;
    return Math.floor((stock * 2) / daily);
  }
  return getDaysRemaining(medicine);
};

const DAY = 86400000;
const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

// For alternate-day medicines: when is the next dose due, based on the last time it was logged.
export const getNextDue = (medicine) => {
  if (!isAlternate(medicine)) return null;
  if (!medicine.lastLoggedAt) return { label: "Not logged yet", due: false };
  const diff = Math.round((startOfDay(medicine.lastLoggedAt) + 2 * DAY - startOfDay(Date.now())) / DAY);
  if (diff < 0) return { label: "Overdue", due: true };
  if (diff === 0) return { label: "Due today", due: true };
  if (diff === 1) return { label: "Due tomorrow", due: false };
  return { label: `Due in ${diff} days`, due: false };
};

// Should this medicine appear in today's schedule?
// daily: yes. alternate: yes if never logged or the next dose is due/overdue. as needed: never (no fixed times).
export const isScheduledToday = (medicine) => {
  if (isAsNeeded(medicine)) return false;
  if (isAlternate(medicine)) {
    if (!medicine.lastLoggedAt) return true;
    // Keep today's items visible after they are marked taken.
    if (startOfDay(medicine.lastLoggedAt) === startOfDay(Date.now())) return true;
    return getNextDue(medicine)?.due ?? true;
  }
  return true;
};
