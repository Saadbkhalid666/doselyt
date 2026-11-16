// Static mock data. Every value here (days remaining, percentages, counts) is precomputed on purpose:
// swap these exports for your own data layer. Components only read what they are given via props.

export const todayLabel = 'Monday, 16 November';
export const profile = { name: 'Personal workspace', initials: 'ME' };

export const medicines = [
  { id: 'm1', name: 'Inograf', strength: '1 mg', form: 'Capsule', priority: 'critical', stock: 84, unit: 'capsules', dailyConsumption: 4, daysRemaining: 21, stockPct: 70, stockStatus: 'healthy' },
  { id: 'm2', name: 'Inograf', strength: '5 mg', form: 'Capsule', priority: 'critical', stock: 30, unit: 'capsules', dailyConsumption: 1, daysRemaining: 30, stockPct: 50, stockStatus: 'healthy' },
  { id: 'm3', name: 'Moflat', strength: '500 mg', form: 'Tablet', priority: 'critical', stock: 36, unit: 'tablets', dailyConsumption: 3, daysRemaining: 12, stockPct: 30, stockStatus: 'low' },
  { id: 'm4', name: 'Prednisolone', strength: '5 mg', form: 'Tablet', priority: 'important', stock: 45, unit: 'tablets', dailyConsumption: 1, daysRemaining: 45, stockPct: 75, stockStatus: 'healthy' },
  { id: 'm5', name: 'Amlodipine', strength: '5 mg', form: 'Tablet', priority: 'important', stock: 28, unit: 'tablets', dailyConsumption: 1, daysRemaining: 28, stockPct: 47, stockStatus: 'healthy' },
  { id: 'm6', name: 'Pantoprazole', strength: '40 mg', form: 'Tablet', priority: 'additional', stock: 9, unit: 'tablets', dailyConsumption: 1, daysRemaining: 9, stockPct: 15, stockStatus: 'low' },
  { id: 'm7', name: 'Vitamin D3', strength: '1000 IU', form: 'Softgel', priority: 'additional', stock: 90, unit: 'softgels', dailyConsumption: 1, daysRemaining: 90, stockPct: 100, stockStatus: 'healthy' },
  { id: 'm8', name: 'Calcium Carbonate', strength: '500 mg', form: 'Tablet', priority: 'additional', stock: 14, unit: 'tablets', dailyConsumption: 2, daysRemaining: 7, stockPct: 12, stockStatus: 'critical' },
];

export const dashboardStats = [
  { id: 'total', label: 'Total medicines', value: '8', hint: '3 critical priority' },
  { id: 'daily', label: 'Active daily doses', value: '14', hint: 'Across 4 time periods' },
  { id: 'completed', label: 'Completed today', value: '9', hint: 'of 14 administrations' },
  { id: 'refills', label: 'Need a refill', value: '3', hint: 'Below your threshold' },
];

const s = (id, time, name, strength, quantity, priority, stock, status) => ({ id, time, name, strength, quantity, priority, stock, status });
export const todaySchedule = [
  { period: 'morning', label: 'Morning', range: '5:00 – 11:59', items: [
    s('s1', '07:30', 'Pantoprazole', '40 mg', '1 tablet', 'additional', '9 tablets', 'taken'),
    s('s2', '08:00', 'Inograf', '1 mg', '1 capsule', 'critical', '84 capsules', 'taken'),
    s('s3', '08:00', 'Inograf', '5 mg', '1 capsule', 'critical', '30 capsules', 'taken'),
    s('s4', '08:00', 'Moflat', '500 mg', '1 tablet', 'critical', '36 tablets', 'taken'),
    s('s5', '08:30', 'Prednisolone', '5 mg', '1 tablet', 'important', '45 tablets', 'taken'),
    s('s6', '09:00', 'Amlodipine', '5 mg', '1 tablet', 'important', '28 tablets', 'taken'),
    s('s7', '09:00', 'Vitamin D3', '1000 IU', '1 softgel', 'additional', '90 softgels', 'taken'),
  ] },
  { period: 'afternoon', label: 'Afternoon', range: '12:00 – 16:59', items: [
    s('s8', '14:00', 'Inograf', '1 mg', '1 capsule', 'critical', '84 capsules', 'taken'),
    s('s9', '14:00', 'Moflat', '500 mg', '1 tablet', 'critical', '36 tablets', 'taken'),
    s('s10', '14:30', 'Calcium Carbonate', '500 mg', '1 tablet', 'additional', '14 tablets', 'missed'),
  ] },
  { period: 'evening', label: 'Evening', range: '17:00 – 20:59', items: [
    s('s11', '18:00', 'Inograf', '1 mg', '1 capsule', 'critical', '84 capsules', 'due'),
  ] },
  { period: 'night', label: 'Night', range: '21:00 – 4:59', items: [
    s('s12', '22:00', 'Inograf', '1 mg', '1 capsule', 'critical', '84 capsules', 'upcoming'),
    s('s13', '22:00', 'Moflat', '500 mg', '1 tablet', 'critical', '36 tablets', 'upcoming'),
    s('s14', '22:30', 'Calcium Carbonate', '500 mg', '1 tablet', 'additional', '14 tablets', 'upcoming'),
  ] },
];

export const refillAlerts = [
  { id: 'r1', name: 'Calcium Carbonate', strength: '500 mg', remaining: '14 tablets', daysRemaining: 7, severity: 'critical', stockPct: 12 },
  { id: 'r2', name: 'Pantoprazole', strength: '40 mg', remaining: '9 tablets', daysRemaining: 9, severity: 'low', stockPct: 15 },
  { id: 'r3', name: 'Moflat', strength: '500 mg', remaining: '36 tablets', daysRemaining: 12, severity: 'low', stockPct: 30 },
];

export const inventoryTrend = [
  { day: 'Nov 3', stock: 292, consumed: 14 }, { day: 'Nov 4', stock: 278, consumed: 14 },
  { day: 'Nov 5', stock: 265, consumed: 13 }, { day: 'Nov 6', stock: 251, consumed: 14 },
  { day: 'Nov 7', stock: 407, consumed: 14 }, { day: 'Nov 8', stock: 393, consumed: 14 },
  { day: 'Nov 9', stock: 380, consumed: 13 }, { day: 'Nov 10', stock: 366, consumed: 14 },
  { day: 'Nov 11', stock: 352, consumed: 14 }, { day: 'Nov 12', stock: 339, consumed: 13 },
  { day: 'Nov 13', stock: 325, consumed: 14 }, { day: 'Nov 14', stock: 311, consumed: 14 },
  { day: 'Nov 15', stock: 298, consumed: 13 }, { day: 'Nov 16', stock: 284, consumed: 14 },
];

export const doses = [
  {
    id: 'd1', name: 'Daily Medication Regimen', totalMedicines: 3, dailyAdministrations: 8,
    availability: '12 days', availabilityPct: 30,
    lowest: { name: 'Moflat', strength: '500 mg', daysRemaining: 12, stockStatus: 'low' },
    medicines: [
      { medicineId: 'm1', name: 'Inograf', strength: '1 mg', form: 'Capsule', quantity: '1 capsule', frequency: 'Four times daily', times: ['08:00', '14:00', '18:00', '22:00'], daysRemaining: 21 },
      { medicineId: 'm2', name: 'Inograf', strength: '5 mg', form: 'Capsule', quantity: '1 capsule', frequency: 'Once daily', times: ['08:00'], daysRemaining: 30 },
      { medicineId: 'm3', name: 'Moflat', strength: '500 mg', form: 'Tablet', quantity: '1 tablet', frequency: 'Three times daily', times: ['08:00', '14:00', '22:00'], daysRemaining: 12 },
    ],
  },
  {
    id: 'd2', name: 'Morning Support', totalMedicines: 3, dailyAdministrations: 3,
    availability: '9 days', availabilityPct: 15,
    lowest: { name: 'Pantoprazole', strength: '40 mg', daysRemaining: 9, stockStatus: 'low' },
    medicines: [
      { medicineId: 'm4', name: 'Prednisolone', strength: '5 mg', form: 'Tablet', quantity: '1 tablet', frequency: 'Once daily', times: ['08:30'], daysRemaining: 45 },
      { medicineId: 'm6', name: 'Pantoprazole', strength: '40 mg', form: 'Tablet', quantity: '1 tablet', frequency: 'Once daily', times: ['07:30'], daysRemaining: 9 },
      { medicineId: 'm7', name: 'Vitamin D3', strength: '1000 IU', form: 'Softgel', quantity: '1 softgel', frequency: 'Once daily', times: ['09:00'], daysRemaining: 90 },
    ],
  },
];

/* ---------- Analytics ---------- */
export const consumptionTrend = [
  { week: 'Sep 22', inograf: 33, moflat: 21, other: 38 }, { week: 'Sep 29', inograf: 35, moflat: 21, other: 40 },
  { week: 'Oct 6', inograf: 35, moflat: 20, other: 40 }, { week: 'Oct 13', inograf: 35, moflat: 21, other: 38 },
  { week: 'Oct 20', inograf: 34, moflat: 21, other: 40 }, { week: 'Oct 27', inograf: 35, moflat: 19, other: 40 },
  { week: 'Nov 3', inograf: 35, moflat: 21, other: 39 }, { week: 'Nov 10', inograf: 35, moflat: 21, other: 40 },
];
export const inventoryHistory = [
  { month: 'Jun', stock: 320 }, { month: 'Jul', stock: 280 }, { month: 'Aug', stock: 410 },
  { month: 'Sep', stock: 350 }, { month: 'Oct', stock: 300 }, { month: 'Nov', stock: 284 },
];
export const adherence = { percent: 94, taken: 263, missed: 17, streak: '6 days', note: 'Last 30 days' };
export const weeklyCompletion = [
  { day: 'Mon', completed: 14, pending: 0 }, { day: 'Tue', completed: 13, pending: 1 },
  { day: 'Wed', completed: 14, pending: 0 }, { day: 'Thu', completed: 14, pending: 0 },
  { day: 'Fri', completed: 12, pending: 2 }, { day: 'Sat', completed: 14, pending: 0 },
  { day: 'Sun', completed: 9, pending: 5 },
];
export const monthlyOverview = [
  { month: 'Jun', taken: 401, missed: 19 }, { month: 'Jul', taken: 410, missed: 24 },
  { month: 'Aug', taken: 421, missed: 14 }, { month: 'Sep', taken: 405, missed: 15 },
  { month: 'Oct', taken: 418, missed: 16 }, { month: 'Nov', taken: 263, missed: 17 },
];
export const refillHistory = [
  { id: 'h1', date: 'Nov 7', medicine: 'Inograf 1 mg', quantity: '120 capsules', source: 'City Pharmacy', status: 'Received' },
  { id: 'h2', date: 'Nov 7', medicine: 'Moflat 500 mg', quantity: '90 tablets', source: 'City Pharmacy', status: 'Received' },
  { id: 'h3', date: 'Oct 12', medicine: 'Amlodipine 5 mg', quantity: '60 tablets', source: 'Green Cross', status: 'Received' },
  { id: 'h4', date: 'Sep 29', medicine: 'Vitamin D3 1000 IU', quantity: '90 softgels', source: 'Online order', status: 'Received' },
  { id: 'h5', date: 'Sep 15', medicine: 'Prednisolone 5 mg', quantity: '60 tablets', source: 'City Pharmacy', status: 'Received' },
];

export const frequencyOptions = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every other day', 'Weekly', 'As needed'];
export const formOptions = ['Capsule', 'Tablet', 'Softgel', 'Syrup', 'Injection', 'Drops', 'Inhaler'];
export const strengthUnits = ['mg', 'mcg', 'g', 'ml', 'IU'];
