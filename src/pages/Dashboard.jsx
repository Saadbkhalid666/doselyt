
import { useEffect, useState } from "react";
import {
  Pill,
  CalendarClock,
  CheckCircle2,
  PackageOpen,
} from "lucide-react";

import PageHeading from "../components/shared/PageHeading.jsx";
import StatCard from "../components/shared/StatCard.jsx";
import ScheduleSection from "../components/dashboard/ScheduleSection.jsx";
import RefillAlerts from "../components/dashboard/RefillAlerts.jsx";
import InventoryOverview from "../components/dashboard/InventoryOverview.jsx";
import InventoryChart from "../components/dashboard/InventoryChart.jsx";
import {
  MEDICINES_KEY,
  DOSES_KEY,
  TRANSACTIONS_KEY,
  getSchedule,
  getDailyConsumption,
  isSyrup,
} from "../utils/medicine.js";
import {
  getDaysLeft,
  getFrequency,
  isAlternate,
  isAsNeeded,
  isScheduledToday,
} from "../utils/frequency.js";

// Same storage keys as the Medicines and Doses pages, so every page reads the same data.
const KEYS = {
  medicines: MEDICINES_KEY,
  doses: DOSES_KEY,
  transactions: TRANSACTIONS_KEY,
  settings: "doselyt_settings",
};

const PERIODS = {
  morning: {
    label: "Morning",
    range: "5 AM – 11:59 AM",
  },
  afternoon: {
    label: "Afternoon",
    range: "12 PM – 4:59 PM",
  },
  evening: {
    label: "Evening",
    range: "5 PM – 8:59 PM",
  },
  night: {
    label: "Night",
    range: "9 PM – 4:59 AM",
  },
};

const STAT_ICONS = {
  total: Pill,
  daily: CalendarClock,
  completed: CheckCircle2,
  refills: PackageOpen,
};

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readSnapshot() {
  let settings = {};

  try {
    settings = JSON.parse(localStorage.getItem(KEYS.settings) || "{}");
  } catch {
    settings = {};
  }

  return {
    medicines: readArray(KEYS.medicines),
    doses: readArray(KEYS.doses),
    transactions: readArray(KEYS.transactions),
    settings:
      settings && typeof settings === "object" && !Array.isArray(settings)
        ? settings
        : {},
  };
}

function saveArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function formatTime(time) {
  if (!time || !time.includes(":")) return time || "";

  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getPeriod(time) {
  const hour = Number(time?.split(":")[0] || 0);

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";

  return "night";
}

const isCompleted = (transaction) =>
  !transaction.status || transaction.status === "completed";

// Dashboard logs use `date`; logs from the Medicines/Doses pages may only have `createdAt`.
const txDate = (transaction) => transaction.date || transaction.createdAt || null;

// Average units used per day, from each medicine's own schedule and frequency.
// Syrup and as-needed medicines have no forecast.
function getDailyUsage(medicines) {
  const usage = {};

  medicines.forEach((medicine) => {
    if (isSyrup(medicine) || isAsNeeded(medicine)) return;

    const daily = Number(getDailyConsumption(medicine)) || 0;
    if (daily > 0) usage[medicine.id] = isAlternate(medicine) ? daily / 2 : daily;
  });

  return usage;
}

function hasTaken(transactions, medicineId, time, dateKey) {
  return transactions.some((transaction) => {
    if (
      transaction.type !== "dose" ||
      !isCompleted(transaction) ||
      transaction.medicineId !== medicineId
    ) {
      return false;
    }

    const date = txDate(transaction);
    if (!date || getDateKey(new Date(date)) !== dateKey) return false;

    const recordedTimes = Array.isArray(transaction.times)
      ? transaction.times
      : transaction.time
        ? [transaction.time]
        : [];

    // "Log dose" / "Log daily dose" entries carry no times and cover the whole day.
    return recordedTimes.length === 0 || recordedTimes.includes(time);
  });
}

// Times and quantities for one medicine: legacy per-dose times first, then its own schedule.
function getEntries(medicine, item) {
  if (item && Array.isArray(item.times) && item.times.length) {
    return item.times.map((time) => ({ time, quantity: Number(item.quantity) || 1 }));
  }

  const entries = getSchedule(medicine);
  if (Array.isArray(entries) && entries.length) return entries;

  if (Array.isArray(medicine.scheduledTimes) && medicine.scheduledTimes.length) {
    return medicine.scheduledTimes.map((time) => ({
      time,
      quantity: Number(medicine.quantityPerAdministration) || 1,
    }));
  }

  return [];
}

function buildSchedule({ medicines, doses, transactions }) {
  const today = getDateKey();
  const currentTime = new Date().toTimeString().slice(0, 5);

  const groups = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  };

  const seen = new Set();

  const addItems = (medicine, dose, entries) => {
    // Syrup and as-needed medicines have no fixed times; alternate-day ones only show on dose days.
    if (isSyrup(medicine) || isAsNeeded(medicine) || !isScheduledToday(medicine)) return;

    entries.forEach(({ time, quantity }) => {
      if (!time) return;

      const uniqueKey = `${medicine.id}-${time}`;
      if (seen.has(uniqueKey)) return;
      seen.add(uniqueKey);

      const taken = hasTaken(transactions, medicine.id, time, today);

      const status = taken
        ? "taken"
        : time < currentTime
          ? "missed"
          : "due";

      groups[getPeriod(time)].push({
        id: uniqueKey,
        medicineId: medicine.id,
        doseId: dose?.id ?? null,
        doseName: dose?.name || "Daily medication",
        name: medicine.name,
        strength: medicine.strength || "",
        form: medicine.form || "",
        quantity: Number(quantity) || 1,
        time,
        displayTime: formatTime(time),
        status,
        priority: medicine.priority || "normal",
        stock: Number.isFinite(Number(medicine.stock)) ? Number(medicine.stock) : null,
        frequency: getFrequency(medicine),
        daysLeft: getDaysLeft(medicine),
      });
    });
  };

  doses.forEach((dose) => {
    (dose.medicines || []).forEach((item) => {
      const id = typeof item === "string" ? item : item.medicineId || item.id;
      const medicine = medicines.find((m) => m.id === id);
      if (!medicine) return;

      addItems(medicine, dose, getEntries(medicine, typeof item === "object" ? item : null));
    });
  });

  // Medicines that are not in any dose group still appear on their own schedule.
  medicines.forEach((medicine) => {
    addItems(medicine, null, getEntries(medicine, null));
  });

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([period, items]) => ({
      period,
      label: PERIODS[period].label,
      range: PERIODS[period].range,
      items: items.sort((a, b) => a.time.localeCompare(b.time)),
    }));
}

function buildInventory(medicines, usage, threshold) {
  return medicines
    .filter(
      (medicine) =>
        !isSyrup(medicine) &&
        Number.isFinite(Number(medicine.stock))
    )
    .map((medicine) => {
      const stock = Number(medicine.stock);
      const dailyUsage = usage[medicine.id] || 0;

      const daysRemaining =
        dailyUsage > 0 ? stock / dailyUsage : null;

      const stockPct =
        daysRemaining === null
          ? 100
          : Math.min(100, (daysRemaining / (threshold * 2)) * 100);

      const stockStatus =
        daysRemaining !== null && daysRemaining <= 3
          ? "critical"
          : daysRemaining !== null && daysRemaining <= threshold
            ? "low"
            : "healthy";

      return {
        ...medicine,
        stock,
        daysRemaining:
          daysRemaining === null
            ? null
            : Math.max(0, Math.floor(daysRemaining)),
        stockPct,
        stockStatus,
        dailyUsage,
      };
    })
    .sort((a, b) => {
      const aDays = a.daysRemaining ?? Infinity;
      const bDays = b.daysRemaining ?? Infinity;

      return aDays - bDays;
    });
}

function buildInventoryTrend(medicines, transactions) {
  const today = new Date();
  const todayKey = getDateKey(today);

  const trackedMedicines = medicines.filter(
    (medicine) =>
      !isSyrup(medicine) &&
      Number.isFinite(Number(medicine.stock))
  );

  const currentStock = trackedMedicines.reduce(
    (sum, medicine) => sum + Number(medicine.stock),
    0
  );

  const quantityFor = (transaction) => {
    const medicine = trackedMedicines.find((m) => m.id === transaction.medicineId);
    return medicine ? Number(transaction.quantity) || 0 : 0;
  };

  const days = [];

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const key = getDateKey(date);

    const dailyConsumption = transactions
      .filter(
        (transaction) =>
          transaction.type === "dose" &&
          isCompleted(transaction) &&
          txDate(transaction) &&
          getDateKey(new Date(txDate(transaction))) === key
      )
      .reduce((sum, transaction) => sum + quantityFor(transaction), 0);

    // Reconstruct historical stock using recorded transactions.
    const futureTransactions = transactions.filter((transaction) => {
      const date = txDate(transaction);
      return (
        date &&
        getDateKey(new Date(date)) > key &&
        getDateKey(new Date(date)) <= todayKey
      );
    });

    const futureConsumption = futureTransactions
      .filter((transaction) => transaction.type === "dose")
      .reduce((sum, transaction) => sum + quantityFor(transaction), 0);

    const futureRefills = futureTransactions
      .filter((transaction) => transaction.type === "refill")
      .reduce((sum, transaction) => sum + quantityFor(transaction), 0);

    days.push({
      day: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date),
      stock: Math.max(
        0,
        currentStock + futureConsumption - futureRefills
      ),
      consumed: dailyConsumption,
    });
  }

  return days;
}

export default function Dashboard({ onNavigate }) {
  const [data, setData] = useState(readSnapshot);

  useEffect(() => {
    const refresh = () => setData(readSnapshot());

    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("doselyt:storage", refresh);
    window.addEventListener("doselyt:medicines-updated", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("doselyt:storage", refresh);
      window.removeEventListener("doselyt:medicines-updated", refresh);
    };
  }, []);

  const {
    medicines,
    doses,
    transactions,
    settings,
  } = data;

  const threshold = Math.max(
    1,
    Number(settings.lowStockThreshold) || 14
  );

  const usage = getDailyUsage(medicines);

  const schedule = buildSchedule({
    medicines,
    doses,
    transactions,
  });

  const allScheduleItems = schedule.flatMap(
    (group) => group.items
  );

  const completedCount = allScheduleItems.filter(
    (item) => item.status === "taken"
  ).length;

  const inventory = buildInventory(
    medicines,
    usage,
    threshold
  );

  const refillAlerts = inventory
    .filter(
      (medicine) =>
        medicine.daysRemaining !== null &&
        medicine.daysRemaining <= threshold
    )
    .map((medicine) => ({
      id: medicine.id,
      medicineId: medicine.id,
      name: medicine.name,
      strength: medicine.strength,
      remaining: medicine.stock,
      daysRemaining: medicine.daysRemaining,
      stockPct: medicine.stockPct,
      severity:
        medicine.daysRemaining <= 3 ? "critical" : "warn",
    }));

  const inventoryTrend = buildInventoryTrend(
    medicines,
    transactions
  );

  const dashboardStats = [
    {
      id: "total",
      label: "Total medicines",
      value: medicines.length,
      hint: "In your inventory",
    },
    {
      id: "daily",
      label: "Daily doses",
      value: allScheduleItems.length,
      hint: "Scheduled administrations",
    },
    {
      id: "completed",
      label: "Completed",
      value: `${completedCount}/${allScheduleItems.length}`,
      hint: "Marked as taken today",
    },
    {
      id: "refills",
      label: "Refill alerts",
      value: refillAlerts.length,
      hint: "Medicines needing attention",
    },
  ];

  // Mark one scheduled administration as taken.
  const handleTaken = (item) => {
    const current = readSnapshot();

    const medicine = current.medicines.find(
      (m) => m.id === item.medicineId
    );

    if (!medicine) {
      window.alert("Medicine not found in inventory.");
      return;
    }

    const today = getDateKey();

    if (
      hasTaken(
        current.transactions,
        item.medicineId,
        item.time,
        today
      )
    ) {
      window.alert("This dose has already been recorded.");
      return;
    }

    const quantity = Number(item.quantity) || 1;

    const tracksStock =
      !isSyrup(medicine) && typeof medicine.stock === "number";

    if (
      tracksStock &&
      medicine.stock < quantity
    ) {
      window.alert(
        `Not enough stock. ${medicine.name} has ${medicine.stock} left, but this dose requires ${quantity}.`
      );
      return;
    }

    const updatedMedicines = current.medicines.map((m) => {
      if (m.id !== medicine.id) return m;

      const now = new Date().toISOString();

      return {
        ...m,
        ...(tracksStock ? { stock: m.stock - quantity } : {}),
        lastLoggedAt: now,
        updatedAt: now,
      };
    });

    const transaction = {
      id:
        globalThis.crypto?.randomUUID?.() ||
        `dose-${Date.now()}-${item.medicineId}`,
      type: "dose",
      status: "completed",
      doseId: item.doseId,
      doseName: item.doseName,
      medicineId: medicine.id,
      medicine: medicine.name,
      strength: medicine.strength || "",
      quantity,
      administrations: 1,
      times: [item.time],
      date: new Date().toISOString(),
      source: "dashboard",
    };

    try {
      saveArray(KEYS.medicines, updatedMedicines);

      try {
        saveArray(KEYS.transactions, [
          ...current.transactions,
          transaction,
        ]);
      } catch (error) {
        saveArray(KEYS.medicines, current.medicines);
        throw error;
      }

      window.dispatchEvent(new Event("doselyt:storage"));
      setData(readSnapshot());
    } catch (error) {
      console.error("Failed to record dose:", error);
      window.alert("Unable to record this dose. Please try again.");
    }
  };

  // Refill a medicine and record the refill transaction.
  const handleRefill = (alert) => {
    const current = readSnapshot();

    const medicine = current.medicines.find(
      (m) => m.id === alert.medicineId
    );

    if (!medicine) {
      window.alert("Medicine not found.");
      return;
    }

    const currentStock = Number(medicine.stock);

    if (!Number.isFinite(currentStock)) {
      window.alert("Stock tracking is not available for this medicine.");
      return;
    }

    const input = window.prompt(
      `Current stock: ${currentStock}\nHow many units of ${medicine.name} are you adding?`,
      "30"
    );

    if (input === null) return;

    const quantity = Number(input);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      window.alert("Please enter a valid positive whole number.");
      return;
    }

    const updatedMedicines = current.medicines.map((m) =>
      m.id === medicine.id
        ? {
            ...m,
            stock: currentStock + quantity,
            updatedAt: new Date().toISOString(),
          }
        : m
    );

    const transaction = {
      id:
        globalThis.crypto?.randomUUID?.() ||
        `refill-${Date.now()}-${medicine.id}`,
      type: "refill",
      status: "completed",
      medicineId: medicine.id,
      medicine: medicine.name,
      strength: medicine.strength || "",
      quantity,
      previousStock: currentStock,
      newStock: currentStock + quantity,
      date: new Date().toISOString(),
      source: "dashboard",
    };

    try {
      saveArray(KEYS.medicines, updatedMedicines);

      try {
        saveArray(KEYS.transactions, [
          ...current.transactions,
          transaction,
        ]);
      } catch (error) {
        saveArray(KEYS.medicines, current.medicines);
        throw error;
      }

      window.dispatchEvent(new Event("doselyt:storage"));
      setData(readSnapshot());
    } catch (error) {
      console.error("Failed to refill medicine:", error);
      window.alert("Unable to save refill. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeading
        title="Dashboard"
        description={`${getTodayLabel()}. Here's what's on for today.`}
      />

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.id}
            {...stat}
            icon={STAT_ICONS[stat.id]}
          />
        ))}
      </div>

      {/* Schedule and inventory */}
      <div className="grid items-start gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ScheduleSection
            groups={schedule}
            onTaken={handleTaken}
          />
        </div>

        <div className="space-y-6">
          <RefillAlerts
            alerts={refillAlerts}
            onRefill={handleRefill}
          />

          <InventoryOverview
            medicines={inventory.slice(0, 6)}
            onViewAll={() => onNavigate?.("medicines")}
          />
        </div>
      </div>

      {/* Inventory history */}
      <InventoryChart data={inventoryTrend} />
    </div>
  );
}
