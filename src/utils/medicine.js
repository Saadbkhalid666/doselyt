export const MEDICINES_KEY = "doselyt_medicines";
export const DOSES_KEY = "doselyt_doses";
export const TRANSACTIONS_KEY = "doselyt_transactions";

export function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function isSyrup(medicine) {
  return String(medicine?.form || "").toLowerCase().includes("syrup");
}

export function getSchedule(medicine) {
  if (Array.isArray(medicine?.schedule) && medicine.schedule.length) {
    return medicine.schedule
      .filter((entry) => entry && entry.time)
      .map((entry) => ({
        time: String(entry.time),
        quantity: Number(entry.quantity) || 0,
      }));
  }

  // Backward compatibility for medicines saved before the schedule model.
  const times = Array.isArray(medicine?.scheduledTimes) && medicine.scheduledTimes.length
    ? medicine.scheduledTimes
    : ["08:00"];
  const quantity = Number(medicine?.quantityPerAdministration) || 1;

  return times.map((time) => ({ time, quantity }));
}

export function getDailyConsumption(medicine) {
  if (isSyrup(medicine)) return null;
  return getSchedule(medicine).reduce((total, item) => total + (Number(item.quantity) || 0), 0);
}

export function getDaysRemaining(medicine) {
  const daily = getDailyConsumption(medicine);
  const stock = Number(medicine?.stock);
  if (daily === null || !Number.isFinite(stock) || daily <= 0) return null;
  return Math.floor(stock / daily);
}

export function getStockStatus(medicine) {
  if (isSyrup(medicine)) return "healthy";
  const stock = Number(medicine?.stock) || 0;
  const days = getDaysRemaining(medicine);
  if (stock <= 0) return "out";
  if (days !== null && days <= 3) return "critical";
  if (days !== null && days <= 7) return "low";
  return "healthy";
}

export function normalizeDose(dose) {
  return {
    ...dose,
    medicines: (dose?.medicines || []).map((item) => ({
      medicineId: typeof item === "string" ? item : item?.medicineId || item?.id,
    })).filter((item) => item.medicineId),
  };
}
