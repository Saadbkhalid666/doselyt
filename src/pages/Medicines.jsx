import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, Pill, Plus } from "lucide-react";
import PageHeading from "../components/shared/PageHeading.jsx";
import Button from "../components/shared/Button.jsx";
import AddMedicineModal from "../components/medicines/AddMedicineModal.jsx";
import MedicineCard from "../components/medicines/MedicineCard.jsx";
import MedicineTable from "../components/medicines/MedicineTable.jsx";
import { MEDICINES_KEY, TRANSACTIONS_KEY, readArray, writeArray, getSchedule, isSyrup } from "../utils/medicine.js";
import { getDaysLeft, isAsNeeded } from "../utils/frequency.js";

export default function Medicines() {
  const [medicines, setMedicines] = useState(() => readArray(MEDICINES_KEY));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [view, setView] = useState("grid");

  useEffect(() => writeArray(MEDICINES_KEY, medicines), [medicines]);

  const saveMedicine = (medicine) => {
    setMedicines((prev) => {
      const exists = prev.some((item) => item.id === medicine.id);
      return exists ? prev.map((item) => item.id === medicine.id ? medicine : item) : [medicine, ...prev];
    });
    window.dispatchEvent(new Event("doselyt:medicines-updated"));
    setModalOpen(false);
    setEditingMedicine(null);
  };

  const deleteMedicine = (medicine) => {
    if (!window.confirm(`Delete ${medicine.name}? Doses referencing it will show it as unavailable.`)) return;
    setMedicines((prev) => prev.filter((item) => item.id !== medicine.id));
    window.dispatchEvent(new Event("doselyt:medicines-updated"));
  };

  // Logs a dose for a single medicine, same rules as Doses.jsx logDose.
  const logMedicineDose = (medicine) => {
    if (isSyrup(medicine)) return;
    // As needed logs one use; everything else logs the full set of scheduled quantities.
    const total = isAsNeeded(medicine)
      ? Number(medicine.perUse) || 0
      : getSchedule(medicine).reduce((sum, entry) => sum + (Number(entry.quantity) || 0), 0);
    if (total <= 0) return;
    if (Number(medicine.stock) < total) {
      alert(`Insufficient stock for ${medicine.name}. No stock was changed.`);
      return;
    }
    const now = new Date().toISOString();
    const transactions = readArray(TRANSACTIONS_KEY);
    transactions.push({
      id: crypto.randomUUID(),
      medicineId: medicine.id,
      type: "dose",
      quantity: total,
      status: "completed",
      date: now,
      source: "medicines",
      createdAt: now,
    });
    writeArray(TRANSACTIONS_KEY, transactions);
    setMedicines((prev) => prev.map((item) => item.id === medicine.id
      ? { ...item, stock: Number(item.stock) - total, lastLoggedAt: now, updatedAt: now }
      : item));
    window.dispatchEvent(new Event("doselyt:medicines-updated"));
  };

  const openEdit = (medicine) => {
    setEditingMedicine(medicine);
    setModalOpen(true);
  };

  // Display-only summary derived from the inventory.
  const summary = useMemo(() => {
    let ok = 0, warn = 0, crit = 0;
    medicines.filter((medicine) => !isSyrup(medicine)).forEach((medicine) => {
      const days = getDaysLeft(medicine);
      if (days == null) return;
      if (days <= 7) crit += 1;
      else if (days <= 14) warn += 1;
      else ok += 1;
    });
    return { ok, warn, crit, tracked: ok + warn + crit };
  }, [medicines]);

  const pct = (count) => (summary.tracked ? (count / summary.tracked) * 100 : 0);

  const headingActions = (
    <Button variant="primary" icon={Plus} onClick={() => { setEditingMedicine(null); setModalOpen(true); }}>Add medicine</Button>
  );

  const toggle = (value, Icon, label) => (
    <button
      type="button"
      aria-pressed={view === value}
      onClick={() => setView(value)}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        view === value ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <PageHeading title="My Medicines" description="Manage medicine details, schedules, and inventory." action={headingActions} />

      {medicines.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted">Inventory</p>
              <p className="text-2xl font-semibold leading-tight">{medicines.length} <span className="text-sm font-normal text-muted">medicines</span></p>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /><span className="text-muted">Healthy</span><strong className="tabular-nums">{summary.ok}</strong></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /><span className="text-muted">Running low</span><strong className="tabular-nums">{summary.warn}</strong></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /><span className="text-muted">Critical</span><strong className="tabular-nums">{summary.crit}</strong></div>
            </div>
          </div>
          <div className="mt-4 flex h-2.5 w-full gap-1 overflow-hidden rounded-full bg-subtle" role="img" aria-label={`${summary.ok} healthy, ${summary.warn} running low, ${summary.crit} critical`}>
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-[width] duration-700" style={{ width: `${pct(summary.ok)}%` }} />
            <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-[width] duration-700" style={{ width: `${pct(summary.warn)}%` }} />
            <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500 transition-[width] duration-700" style={{ width: `${pct(summary.crit)}%` }} />
          </div>
        </section>
      )}

      <div className="flex justify-end">
        <div className="inline-flex gap-1 rounded-xl bg-subtle p-1 ring-1 ring-inset ring-line">
          {toggle("grid", LayoutGrid, "Cards")}
          {toggle("table", List, "Table")}
        </div>
      </div>

      {view === "grid" ? (
        medicines.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {medicines.map((medicine) => <MedicineCard key={medicine.id} medicine={medicine} onEdit={openEdit} onDelete={deleteMedicine} onLogDose={logMedicineDose} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-line p-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><Pill className="h-6 w-6" /></span>
            <p className="mt-4 text-sm font-medium">No medicines yet</p>
            <p className="mt-1 text-sm text-muted">Add your first medicine to start tracking stock and schedules.</p>
          </div>
        )
      ) : <MedicineTable medicines={medicines} onEdit={openEdit} onDelete={deleteMedicine} />}

      <AddMedicineModal open={modalOpen} medicine={editingMedicine} onClose={() => { setModalOpen(false); setEditingMedicine(null); }} onSubmit={saveMedicine} />
    </div>
  );
}
