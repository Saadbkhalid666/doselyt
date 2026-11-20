
import { useEffect, useState } from "react";
import { Plus, Layers } from "lucide-react";

import PageHeading from "../components/shared/PageHeading.jsx";
import Button from "../components/shared/Button.jsx";
import EmptyState from "../components/shared/EmptyState.jsx";
import { CardGridSkeleton } from "../components/shared/Skeleton.jsx";
import { ConfirmDialog } from "../components/shared/Modal.jsx";

import DoseCard from "../components/doses/DoseCard.jsx";
import DoseBuilderModal from "../components/doses/DoseBuilderModal.jsx";

import useSimulatedLoad from "../hooks/useSimulatedLoad.js";

const MEDICINES_KEY = "doselyt_medicines";
const DOSES_KEY = "doselyt_doses";
const TRANSACTIONS_KEY = "doselyt_transactions";

const readStorage = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export default function Doses() {
  const loading = useSimulatedLoad();

  const [medicines, setMedicines] = useState(() =>
    readStorage(MEDICINES_KEY)
  );

  const [doses, setDoses] = useState(() =>
    readStorage(DOSES_KEY)
  );

  const [doseForm, setDoseForm] = useState({
    open: false,
    dose: null,
  });

  const [toDelete, setToDelete] = useState(null);
  const [notification, setNotification] = useState("");

  // Sync medicines and doses across browser tabs.
  useEffect(() => {
    const syncStorage = (event) => {
      if (event.key === MEDICINES_KEY) {
        setMedicines(readStorage(MEDICINES_KEY));
      }

      if (event.key === DOSES_KEY) {
        setDoses(readStorage(DOSES_KEY));
      }
    };

    window.addEventListener("storage", syncStorage);

    return () => {
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  // Persist doses.
  useEffect(() => {
    try {
      localStorage.setItem(DOSES_KEY, JSON.stringify(doses));
    } catch (error) {
      console.error("Unable to save doses:", error);
    }
  }, [doses]);

  const showNotification = (message) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  const create = () => {
    setDoseForm({
      open: true,
      dose: null,
    });
  };

  const editDose = (dose) => {
    setDoseForm({
      open: true,
      dose,
    });
  };

  const closeDoseForm = () => {
    setDoseForm({
      open: false,
      dose: null,
    });
  };

  const handleDoseSubmit = (doseData) => {
    const validMedicineIds = new Set(
      medicines.map((medicine) => medicine.id)
    );

    const validItems = doseData.medicines.filter((item) =>
      validMedicineIds.has(item.medicineId)
    );

    if (validItems.length === 0) {
      alert("Please add at least one medicine from My Medicines.");
      return;
    }

    const updatedDose = {
      ...doseData,
      medicines: validItems,
    };

    setDoses((previous) => {
      const exists = previous.some(
        (dose) => dose.id === updatedDose.id
      );

      return exists
        ? previous.map((dose) =>
            dose.id === updatedDose.id ? updatedDose : dose
          )
        : [...previous, updatedDose];
    });

    closeDoseForm();
  };

  // Log one complete day's dose.
  
// Log one complete day's dose.

const handleLogDose = (dose) => {
  const doseMedicines = Array.isArray(dose.medicines)
    ? dose.medicines
    : [];

  if (doseMedicines.length === 0) {
    showNotification("This dose has no medicines.");
    return;
  }

  const requirements = new Map();
  const now = new Date().toISOString();

  // Validate medicines and calculate inventory requirements.
  for (const item of doseMedicines) {
    const medicine = medicines.find(
      (med) => med.id === item.medicineId
    );

    if (!medicine) {
      showNotification("A medicine in this dose no longer exists.");
      return;
    }

    const isSyrup = String(medicine.form || "")
      .toLowerCase()
      .includes("syrup");

    const quantity = Number(item.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      showNotification(`Invalid quantity for ${medicine.name}.`);
      return;
    }

    const administrations =
      Array.isArray(item.times) && item.times.length > 0
        ? item.times.length
        : 1;

    const totalQuantity = quantity * administrations;

    if (!isSyrup) {
      requirements.set(
        item.medicineId,
        (requirements.get(item.medicineId) || 0) + totalQuantity
      );
    }
  }

  // Prepare updated inventory.
  const updatedMedicines = medicines.map((medicine) => ({
    ...medicine,
  }));

  for (const [medicineId, requiredQuantity] of requirements) {
    const index = updatedMedicines.findIndex(
      (medicine) => medicine.id === medicineId
    );

    const medicine = updatedMedicines[index];
    const available = Number(medicine.stock);

    if (
      !Number.isFinite(available) ||
      available < requiredQuantity
    ) {
      showNotification(`Insufficient stock for ${medicine.name}.`);
      return;
    }

    updatedMedicines[index] = {
      ...medicine,
      stock: available - requiredQuantity,
    };
  }

  // Create a transaction for every medicine, including syrups.
  const transactions = doseMedicines.map((item) => {
    const medicine = medicines.find(
      (med) => med.id === item.medicineId
    );

    const administrations =
      Array.isArray(item.times) && item.times.length > 0
        ? item.times.length
        : 1;

    return {
      id: crypto.randomUUID(),
      type: "dose",
      status: "completed",

      doseId: dose.id,
      doseName: dose.name,

      medicineId: medicine.id,
      medicine: medicine.name,
      strength: medicine.strength,

      quantity: Number(item.quantity) * administrations,
      administrations,
      times: item.times || [],

      date: now,
    };
  });

  // Persist inventory and transaction history.
  try {
    const previousTransactions = JSON.parse(
      localStorage.getItem(TRANSACTIONS_KEY) || "[]"
    );

    if (!Array.isArray(previousTransactions)) {
      throw new Error("Invalid transaction history.");
    }

    localStorage.setItem(
      MEDICINES_KEY,
      JSON.stringify(updatedMedicines)
    );

    localStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify([
        ...previousTransactions,
        ...transactions,
      ])
    );

    setMedicines(updatedMedicines);

    showNotification(`${dose.name} logged successfully.`);
  } catch (error) {
    console.error("Unable to save dose transaction:", error);

    // Restore previous inventory if saving history fails.
    try {
      localStorage.setItem(
        MEDICINES_KEY,
        JSON.stringify(medicines)
      );
    } catch (rollbackError) {
      console.error("Inventory rollback failed:", rollbackError);
    }

    showNotification("Unable to save dose. Please try again.");
  }
};



  const handleDelete = () => {
    if (!toDelete) return;

    setDoses((previous) =>
      previous.filter((dose) => dose.id !== toDelete.id)
    );

    setToDelete(null);
  };

  return (
    <>
      <PageHeading
        title="My Doses"
        description="Group medicines you take together into a named regimen. Regimens reference your existing medicines."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={create}
          >
            Create dose
          </Button>
        }
      />

      {notification && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-ink"
        >
          {notification}
        </div>
      )}

      {loading ? (
        <CardGridSkeleton
          count={2}
          cols="lg:grid-cols-2"
          height="h-96"
        />
      ) : doses.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No doses yet"
          description="Combine medicines you already track into a regimen you can follow each day."
          action={
            <Button
              variant="primary"
              icon={Plus}
              onClick={create}
              disabled={medicines.length === 0}
            >
              Create dose
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {doses.map((dose) => (
            <DoseCard
              key={dose.id}
              dose={dose}
              medicines={medicines}
              onEdit={editDose}
              onDelete={setToDelete}
              onLogDose={handleLogDose}
            />
          ))}
        </div>
      )}

      <DoseBuilderModal
        open={doseForm.open}
        initialDose={doseForm.dose}
        medicines={medicines}
        onClose={closeDoseForm}
        onSubmit={handleDoseSubmit}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete dose?"
        description={`"${toDelete?.name ?? ""}" will be removed. The medicines in it stay in My Medicines.`}
      />
    </>
  );
}
