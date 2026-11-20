
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
  const requirements = new Map();

  const doseMedicines = Array.isArray(dose.medicines)
    ? dose.medicines
    : [];

  // Calculate daily stock requirements.
  for (const item of doseMedicines) {
    const medicine = medicines.find(
      (med) => med.id === item.medicineId
    );

    if (!medicine) {
      showNotification("A medicine in this dose no longer exists.");
      return;
    }

    // Syrups do not have stock or quantity tracking.
    const isSyrup = String(medicine.form || "")
      .toLowerCase()
      .includes("syrup");

    if (isSyrup) continue;

    const quantity = Number(item.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      showNotification(
        `Invalid quantity for ${medicine.name}.`
      );
      return;
    }

    // Calculate administrations per day.
    const administrationsPerDay =
      Array.isArray(item.times) && item.times.length > 0
        ? item.times.length
        : 1;

    const dailyQuantity = quantity * administrationsPerDay;

    requirements.set(
      item.medicineId,
      (requirements.get(item.medicineId) || 0) + dailyQuantity
    );
  }

  // Validate stock before deducting anything.
  const updatedMedicines = medicines.map((medicine) => ({
    ...medicine,
  }));

  for (const [medicineId, requiredQuantity] of requirements) {
    const medicineIndex = updatedMedicines.findIndex(
      (medicine) => medicine.id === medicineId
    );

    if (medicineIndex === -1) {
      showNotification("A medicine in this dose no longer exists.");
      return;
    }

    const medicine = updatedMedicines[medicineIndex];
    const available = Number(medicine.stock);

    if (
      !Number.isFinite(available) ||
      available < requiredQuantity
    ) {
      showNotification(
        `Insufficient stock for ${medicine.name}.`
      );
      return;
    }

    updatedMedicines[medicineIndex] = {
      ...medicine,
      stock: available - requiredQuantity,
    };
  }

  // Syrup-only regimens are valid too.
  // They simply do not require inventory deductions.
  if (requirements.size === 0) {
    showNotification(`${dose.name} logged successfully.`);
    return;
  }

  // Save inventory.
  try {
    localStorage.setItem(
      MEDICINES_KEY,
      JSON.stringify(updatedMedicines)
    );
  } catch (error) {
    console.error("Unable to update inventory:", error);
    showNotification("Unable to save inventory. Please try again.");
    return;
  }

  setMedicines(updatedMedicines);

  showNotification(`${dose.name} logged successfully.`);
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
