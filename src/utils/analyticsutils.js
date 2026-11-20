
const STORAGE_KEYS = {
  medicines: "doselyt_medicines",
  doses: "doselyt_doses",
  transactions: "doselyt_transactions",
};

const readStorage = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const getDateKey = (date) => {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (date) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const getDaysAgo = (days) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days + 1);
  return date;
};

const getMedicineCategory = (name) => {
  const value = String(name || "").toLowerCase();

  if (value.includes("inograf")) return "inograf";

  if (
    value.includes("mofetyl") ||
    value.includes("moflat")
  ) {
    return "moflat";
  }

  return "other";
};

const getDailyAdministrations = (doses) => {
  return doses.reduce((total, dose) => {
    const medicines = Array.isArray(dose.medicines)
      ? dose.medicines
      : [];

    return total + medicines.reduce((sum, medicine) => {
      const times = Array.isArray(medicine.times)
        ? medicine.times
        : [];

      return sum + (times.length || 1);
    }, 0);
  }, 0);
};

const groupByDate = (transactions) => {
  return transactions.reduce((groups, transaction) => {
    const key = getDateKey(transaction.date);

    if (!groups[key]) groups[key] = [];

    groups[key].push(transaction);

    return groups;
  }, {});
};

export function getAnalyticsData(range = "30d") {
  const medicines = readStorage(STORAGE_KEYS.medicines);
  const doses = readStorage(STORAGE_KEYS.doses);
  const transactions = readStorage(STORAGE_KEYS.transactions);

  const days = Number.parseInt(range, 10) || 30;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = getDateKey(today);
  const startDate = getDaysAgo(days);
  const startKey = getDateKey(startDate);

  const doseTransactions = transactions.filter(
    (item) =>
      item.type === "dose" &&
      item.status === "completed" &&
      item.date &&
      !Number.isNaN(new Date(item.date).getTime())
  );

  const refillTransactions = transactions.filter(
    (item) =>
      item.type === "refill" &&
      item.date &&
      !Number.isNaN(new Date(item.date).getTime())
  );

  const filteredTransactions = doseTransactions.filter((item) => {
    const date = getDateKey(item.date);
    return date >= startKey && date <= todayKey;
  });

  const dailyTransactions = groupByDate(filteredTransactions);

  const firstTransaction = doseTransactions.length
    ? doseTransactions
        .map((item) => getDateKey(item.date))
        .sort()[0]
    : null;

  // Consumption trend
  const consumptionMap = {};

  filteredTransactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const weekStart = new Date(date);

    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weekKey = getDateKey(weekStart);

    if (!consumptionMap[weekKey]) {
      consumptionMap[weekKey] = {
        week: formatDate(weekStart),
        inograf: 0,
        moflat: 0,
        other: 0,
      };
    }

    const category = getMedicineCategory(transaction.medicine);

    consumptionMap[weekKey][category] +=
      Number(transaction.quantity) || 0;
  });

  const consumptionTrend = Object.entries(consumptionMap)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, value]) => value);

  // Daily completion
  const expectedPerDay = getDailyAdministrations(doses);

  const trackingStart = firstTransaction
    ? firstTransaction > startKey
      ? firstTransaction
      : startKey
    : null;

  const weeklyCompletion = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const key = getDateKey(date);

    const completed = (dailyTransactions[key] || []).reduce(
      (sum, item) => sum + (Number(item.administrations) || 1),
      0
    );

    const isTracking =
      trackingStart && key >= trackingStart;

    const expected = isTracking ? expectedPerDay : 0;

    weeklyCompletion.push({
      day: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      completed,
      pending: Math.max(0, expected - completed),
    });
  }

  // Adherence
  let totalTaken = 0;
  let totalExpected = 0;

  if (trackingStart) {
    const cursor = new Date(`${trackingStart}T12:00:00`);

    while (getDateKey(cursor) <= todayKey) {
      const key = getDateKey(cursor);

      const completed = (dailyTransactions[key] || []).reduce(
        (sum, item) => sum + (Number(item.administrations) || 1),
        0
      );

      totalTaken += completed;

      totalExpected += expectedPerDay;

      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const missed = Math.max(0, totalExpected - totalTaken);

  const adherencePercent = totalExpected > 0
    ? Math.min(100, Math.round((totalTaken / totalExpected) * 100))
    : 0;

  // Current consecutive completion streak
  let streak = 0;

  if (trackingStart && expectedPerDay > 0) {
    const cursor = new Date(today);

    // Allow today to remain in progress.
    const todayCompleted = (dailyTransactions[todayKey] || []).reduce(
      (sum, item) => sum + (Number(item.administrations) || 1),
      0
    );

    if (todayCompleted < expectedPerDay) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (getDateKey(cursor) >= trackingStart) {
      const key = getDateKey(cursor);

      const completed = (dailyTransactions[key] || []).reduce(
        (sum, item) => sum + (Number(item.administrations) || 1),
        0
      );

      if (completed < expectedPerDay) break;

      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  const adherence = {
    percent: adherencePercent,
    taken: totalTaken,
    missed,
    streak,
    note: trackingStart
      ? "Estimated from your current dose schedule and recorded activity"
      : "Log your first dose to start tracking adherence",
  };

  // Monthly overview
  const monthlyMap = {};

  filteredTransactions.forEach((transaction) => {
    const date = new Date(transaction.date);

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        taken: 0,
        missed: 0,
      };
    }

    monthlyMap[key].taken +=
      Number(transaction.administrations) || 1;
  });

  // Add estimated pending administrations to monthly totals.
  if (trackingStart) {
    const cursor = new Date(`${trackingStart}T12:00:00`);

    while (getDateKey(cursor) <= todayKey) {
      const key = getDateKey(cursor);

      const monthKey = key.slice(0, 7);

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: cursor.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          taken: 0,
          missed: 0,
        };
      }

      const completed = (dailyTransactions[key] || []).reduce(
        (sum, item) => sum + (Number(item.administrations) || 1),
        0
      );

      monthlyMap[monthKey].missed += Math.max(
        0,
        expectedPerDay - completed
      );

      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const monthlyOverview = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);

  // Inventory history
  const trackedMedicines = medicines.filter(
    (medicine) =>
      !String(medicine.form || "").toLowerCase().includes("syrup")
  );

  const inventoryHistory = [];

  const currentStock = trackedMedicines.reduce(
    (sum, medicine) => sum + Math.max(0, Number(medicine.stock) || 0),
    0
  );

  const inventoryTransactions = transactions.filter(
    (item) =>
      (item.type === "dose" || item.type === "refill") &&
      item.date &&
      !Number.isNaN(new Date(item.date).getTime()) &&
      item.date <= new Date().toISOString() &&
      trackedMedicines.some((medicine) => medicine.id === item.medicineId)
  );

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const key = getDateKey(date);

    const futureChanges = inventoryTransactions.filter(
      (item) => getDateKey(item.date) > key
    );

    const futureDeductions = futureChanges
      .filter((item) => item.type === "dose")
      .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    const futureRefills = futureChanges
      .filter((item) => item.type === "refill")
      .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    inventoryHistory.push({
      month: formatDate(date),
      stock: Math.max(
        0,
        currentStock + futureDeductions - futureRefills
      ),
    });
  }

  // Refill history
  const refillHistory = refillTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((item) => ({
      id: item.id,
      date: formatDate(item.date),
      medicine: item.medicine || "Unknown medicine",
      quantity: item.quantity,
      source: item.source || "Manual",
      status: item.status || "Completed",
    }));

  return {
    consumptionTrend,
    inventoryHistory,
    adherence,
    weeklyCompletion,
    monthlyOverview,
    refillHistory,
  };
}
