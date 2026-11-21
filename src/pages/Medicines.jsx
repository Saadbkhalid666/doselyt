
import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  LayoutGrid,
  List,
  Pill,
} from "lucide-react";

import PageHeading from "../components/shared/PageHeading.jsx";
import Button, { IconButton } from "../components/shared/Button.jsx";

import {
  SearchInput,
  FilterTabs,
} from "../components/shared/Form.jsx";

import EmptyState from "../components/shared/EmptyState.jsx";
import { CardGridSkeleton } from "../components/shared/Skeleton.jsx";
import { ConfirmDialog } from "../components/shared/Modal.jsx";

import MedicineCard from "../components/medicines/MedicineCard.jsx";
import MedicineTable from "../components/medicines/MedicineTable.jsx";
import AddMedicineModal from "../components/medicines/AddMedicineModal.jsx";

import useSimulatedLoad from "../hooks/useSimulatedLoad.js";

const MEDICINES_KEY = "doselyt_medicines";
const DOSES_KEY = "doselyt_doses";

const readStorage = (key) => {
  try {
    const stored = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const priorityFilters = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "important", label: "Important" },
  { value: "additional", label: "Additional" },
];

function getAdministrations(item) {
  if (
    Array.isArray(item.administrations) &&
    item.administrations.length > 0
  ) {
    return item.administrations;
  }

  const times =
    Array.isArray(item.times) && item.times.length
      ? item.times
      : ["08:00"];

  return times.map((time) => ({
    time,
    quantity: Number(item.quantity) || 1,
  }));
}

function isSyrup(form) {
  return String(form || "").toLowerCase().includes("syrup");
}

export default function Medicines() {
  const loading = useSimulatedLoad();

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const [view, setView] = useState("grid");

  const [form, setForm] = useState({
    open: false,
    medicine: null,
  });

  const [toDelete, setToDelete] = useState(null);

  const [medicines, setMedicines] = useState(() =>
    readStorage(MEDICINES_KEY)
  );

  const [doses, setDoses] = useState(() =>
    readStorage(DOSES_KEY)
  );

  // Synchronize data across browser tabs.
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

  // Aggregate consumption across all saved regimens.
  const medicineList = useMemo(() => {
    const usageMap = new Map();

    doses.forEach((dose) => {
      (dose.medicines || []).forEach((item) => {
        const administrations = getAdministrations(item);

        const dailyUsage = administrations.reduce(
          (total, administration) =>
            total +
            Math.max(
              0,
              Number(administration.quantity) || 0
            ),
          0
        );

        usageMap.set(
          item.medicineId,
          (usageMap.get(item.medicineId) || 0) + dailyUsage
        );
      });
    });

    return medicines.map((medicine) => {
      const syrup = isSyrup(medicine.form);

      const dailyConsumption = syrup
        ? 0
        : usageMap.get(medicine.id) || 0;

      const stock = Math.max(
        0,
        Number(medicine.stock) || 0
      );

      const daysRemaining =
        dailyConsumption > 0
          ? Math.floor(stock / dailyConsumption)
          : 0;

      let stockStatus;

      if (syrup) {
        stockStatus = "healthy";
      } else if (stock <= 0) {
        stockStatus = "out";
      } else if (dailyConsumption <= 0) {
        stockStatus = "healthy";
      } else if (daysRemaining <= 4) {
        stockStatus = "critical";
      } else if (daysRemaining <= 8) {
        stockStatus = "low";
      } else {
        stockStatus = "healthy";
      }

      const stockPct =
        dailyConsumption > 0
          ? Math.min(
              (stock / (dailyConsumption * 60)) * 100,
              100
            )
          : 0;

      return {
        ...medicine,
        dailyConsumption,
        daysRemaining,
        stockStatus,
        stockPct,
      };
    });
  }, [medicines, doses]);

  const list = medicineList.filter((medicine) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      String(medicine.name || "").toLowerCase().includes(query) ||
      String(medicine.strength || "").toLowerCase().includes(query) ||
      String(medicine.form || "").toLowerCase().includes(query);

    const matchesPriority =
      priority === "all" ||
      medicine.priority === priority;

    return matchesSearch && matchesPriority;
  });

  const handleDeleteMedicine = (id) => {
    setMedicines((previous) => {
      const updated = previous.filter(
        (medicine) => medicine.id !== id
      );

      localStorage.setItem(
        MEDICINES_KEY,
        JSON.stringify(updated)
      );

      return updated;
    });

    setToDelete(null);
  };

  const handleMedicineSubmit = (savedMedicine) => {
    setMedicines((previous) => {
      const exists = previous.some(
        (medicine) => medicine.id === savedMedicine.id
      );

      const updated = exists
        ? previous.map((medicine) =>
            medicine.id === savedMedicine.id
              ? savedMedicine
              : medicine
          )
        : [...previous, savedMedicine];

      localStorage.setItem(
        MEDICINES_KEY,
        JSON.stringify(updated)
      );

      return updated;
    });

    setForm({
      open: false,
      medicine: null,
    });
  };

  return (
    <>
      <PageHeading
        title="My Medicines"
        description="Manage your medicines, available stock, and consumption across all your regimens."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() =>
              setForm({ open: true, medicine: null })
            }
          >
            Add medicine
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          className="sm:w-72"
          value={search}
          onChange={(value) =>
            setSearch(
              value?.target ? value.target.value : value
            )
          }
          placeholder="Search medicines"
        />

        <FilterTabs
          options={priorityFilters}
          value={priority}
          onChange={setPriority}
          className="self-start"
        />

        <div className="hidden gap-0.5 rounded-md border border-line p-0.5 sm:ml-auto md:flex">
          <IconButton
            icon={LayoutGrid}
            label="Card view"
            onClick={() => setView("grid")}
            className={
              view === "grid" ? "!bg-subtle !text-ink" : ""
            }
          />

          <IconButton
            icon={List}
            label="Table view"
            onClick={() => setView("table")}
            className={
              view === "table" ? "!bg-subtle !text-ink" : ""
            }
          />
        </div>
      </div>

      {loading ? (
        <CardGridSkeleton count={6} height="h-52" />
      ) : list.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No medicines yet"
          description="Add your first medicine to start tracking inventory and consumption."
          action={
            <Button
              variant="primary"
              icon={Plus}
              onClick={() =>
                setForm({ open: true, medicine: null })
              }
            >
              Add medicine
            </Button>
          }
        />
      ) : (
        <>
          {view === "table" && (
            <div className="hidden md:block">
              <MedicineTable
                medicines={list}
                onEdit={(medicine) =>
                  setForm({
                    open: true,
                    medicine,
                  })
                }
                onDelete={(id) => {
                  const medicine = medicines.find(
                    (item) => item.id === id
                  );

                  setToDelete(medicine || null);
                }}
              />
            </div>
          )}

          <div
            className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 ${
              view === "table" ? "md:hidden" : ""
            }`}
          >
            {list.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                onEdit={(med) =>
                  setForm({
                    open: true,
                    medicine: med,
                  })
                }
                onDelete={(id) => {
                  const found = medicines.find(
                    (item) => item.id === id
                  );

                  setToDelete(found || null);
                }}
              />
            ))}
          </div>
        </>
      )}

      <AddMedicineModal
        key={form.medicine?.id || "new"}
        open={form.open}
        medicine={form.medicine}
        onClose={() =>
          setForm({
            open: false,
            medicine: null,
          })
        }
        onSubmit={handleMedicineSubmit}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          handleDeleteMedicine(toDelete?.id)
        }
        title="Delete medicine?"
        description={`${toDelete?.name ?? ""} ${
          toDelete?.strength ?? ""
        } will be removed from inventory. Existing regimens referencing it will need to be updated.`}
      />
    </>
  );
}
