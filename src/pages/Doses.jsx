import { useEffect, useState } from "react";
import { Layers, Plus } from "lucide-react";
import PageHeading from "../components/shared/PageHeading.jsx";
import Button from "../components/shared/Button.jsx";
import DoseBuilderModal from "../components/doses/DoseBuilderModal.jsx";
import DoseCard from "../components/doses/DoseCard.jsx";
import { DOSES_KEY, MEDICINES_KEY, TRANSACTIONS_KEY, normalizeDose, readArray, writeArray, getSchedule, isSyrup } from "../utils/medicine.js";
import { isAsNeeded } from "../utils/frequency.js";

export default function Doses() {
  const [doses, setDoses] = useState(() => readArray(DOSES_KEY).map(normalizeDose));
  const [medicines, setMedicines] = useState(() => readArray(MEDICINES_KEY));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDose, setEditingDose] = useState(null);

  useEffect(() => writeArray(DOSES_KEY, doses), [doses]);
  useEffect(() => {
    const refresh = () => setMedicines(readArray(MEDICINES_KEY));
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("doselyt:medicines-updated", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("doselyt:medicines-updated", refresh);
    };
  }, []);

  const saveDose = (dose) => {
    setDoses((prev) => {
      const exists = prev.some((item) => item.id === dose.id);
      return exists ? prev.map((item) => item.id === dose.id ? dose : item) : [dose, ...prev];
    });
    setModalOpen(false);
    setEditingDose(null);
  };

  const deleteDose = (dose) => {
    if (!window.confirm(`Delete dose "${dose.name}"?`)) return;
    setDoses((prev) => prev.filter((item) => item.id !== dose.id));
  };

  const logDose = (dose) => {
    const inventory = readArray(MEDICINES_KEY);
    const transactions = readArray(TRANSACTIONS_KEY);
    const updates = [];
    for (const item of dose.medicines || []) {
      const medicine = inventory.find((entry) => entry.id === item.medicineId);
      if (!medicine || isSyrup(medicine) || isAsNeeded(medicine)) continue;
      const total = getSchedule(medicine).reduce((sum, entry) => sum + (Number(entry.quantity) || 0), 0);
      if (total > 0) updates.push({ medicineId: medicine.id, quantity: total });
    }
    const insufficient = updates.find((entry) => {
      const medicine = inventory.find((item) => item.id === entry.medicineId);
      return Number(medicine.stock) < entry.quantity;
    });
    if (insufficient) {
      const medicine = inventory.find((item) => item.id === insufficient.medicineId);
      alert(`Insufficient stock for ${medicine.name}. No stock was changed.`);
      return;
    }

    const now = new Date().toISOString();
    const updatedInventory = inventory.map((medicine) => {
      const used = updates.find((entry) => entry.medicineId === medicine.id);
      if (!used) return medicine;
      transactions.push({
        id: crypto.randomUUID(),
        medicineId: medicine.id,
        type: "dose",
        quantity: used.quantity,
        doseId: dose.id,
        status: "completed",
        date: now,
        source: "doses",
        createdAt: now,
      });
      return { ...medicine, stock: Number(medicine.stock) - used.quantity, lastLoggedAt: now, updatedAt: now };
    });
    writeArray(MEDICINES_KEY, updatedInventory);
    writeArray(TRANSACTIONS_KEY, transactions);
    setMedicines(updatedInventory);
    alert("Daily dose logged and stock updated.");
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Doses"
        description="Group existing medicines into named regimens."
        action={<Button variant="primary" icon={Plus} onClick={() => { setEditingDose(null); setModalOpen(true); }}>Create dose</Button>}
      />
      {doses.length ? (
        <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          {doses.map((dose) => (
            <DoseCard
              key={dose.id}
              dose={dose}
              medicines={medicines}
              onEdit={(item) => { setEditingDose(item); setModalOpen(true); }}
              onDelete={deleteDose}
              onLogDose={logDose}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-line p-12 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><Layers className="h-6 w-6" /></span>
          <p className="mt-4 text-sm font-medium">No doses yet</p>
          <p className="mt-1 text-sm text-muted">Create a dose and select medicines from your inventory.</p>
        </div>
      )}
      <DoseBuilderModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingDose(null); }} onSubmit={saveDose} medicines={medicines} initialDose={editingDose} />
    </div>
  );
}
