import { useState } from "react";
import { Plus, LayoutGrid, List, Pill } from "lucide-react";
import PageHeading from "../components/shared/PageHeading.jsx";
import Button, { IconButton } from "../components/shared/Button.jsx";
import { SearchInput, FilterTabs } from "../components/shared/Form.jsx";
import EmptyState from "../components/shared/EmptyState.jsx";
import { CardGridSkeleton } from "../components/shared/Skeleton.jsx";
import { ConfirmDialog } from "../components/shared/Modal.jsx";
import MedicineCard from "../components/medicines/MedicineCard.jsx";
import MedicineTable from "../components/medicines/MedicineTable.jsx";
import AddMedicineModal from "../components/medicines/AddMedicineModal.jsx";
import useSimulatedLoad from "../hooks/useSimulatedLoad.js";
// import { medicines } from '../data/mockData.js';

const priorityFilters = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "important", label: "Important" },
  { value: "additional", label: "Additional" },
];

export default function Medicines() {
  const loading = useSimulatedLoad();
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const [view, setView] = useState("grid");
  const [form, setForm] = useState({ open: false, medicine: null });
  const [toDelete, setToDelete] = useState(null);

  const [medicines, setMedicines] = useState(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("doselyt_medicines") || "[]",
      );

      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });

  const handleMedicineSubmit = (savedMedicine) => {
    setMedicines((prev) => {
      const exists = prev.some((m) => m.id === savedMedicine.id);

      const updated = exists
        ? prev.map((m) => (m.id === savedMedicine.id ? savedMedicine : m))
        : [...prev, savedMedicine];

      localStorage.setItem("doselyt_medicines", JSON.stringify(updated));

      return updated;
    });

    setForm({ open: false, medicine: null });
  };

  // The search + priority controls are UI only: filter `medicines` yourself using `search` and `priority`.
  const list = Array.isArray(medicines) ? medicines : [];

  return (
    <>
      <PageHeading
        title="My Medicines"
        description="Everything you track, with stock levels and how long each will last."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setForm({ open: true, medicine: null })}
          >
            Add medicine
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          className="sm:w-72"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
            className={view === "grid" ? "!bg-subtle !text-ink" : ""}
          />
          <IconButton
            icon={List}
            label="Table view"
            onClick={() => setView("table")}
            className={view === "table" ? "!bg-subtle !text-ink" : ""}
          />
        </div>
      </div>

      {loading ? (
        <CardGridSkeleton count={6} height="h-52" />
      ) : list.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No medicines yet"
          description="Add your first medicine to start tracking stock and schedules."
          action={
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setForm({ open: true, medicine: null })}
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
                onEdit={(m) => setForm({ open: true, medicine: m })}
                onDelete={setToDelete}
              />
            </div>
          )}
          <div
            className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 ${view === "table" ? "md:hidden" : ""}`}
          >
            {list.map((m) => (
              <MedicineCard
                key={m.id}
                medicine={m}
                onEdit={(med) => setForm({ open: true, medicine: med })}
                onDelete={setToDelete}
                onTaken={(med) => console.log("Taken", med)}
              />
            ))}
          </div>
        </>
      )}

      <AddMedicineModal
        key={form.medicine?.id || "new"}
        open={form.open}
        medicine={form.medicine}
        onClose={() => setForm({ open: false, medicine: null })}
        onSubmit={handleMedicineSubmit}
      />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => setToDelete(null)}
        title="Delete medicine?"
        description={`${toDelete?.name ?? ""} ${toDelete?.strength ?? ""} and its schedule will be removed. This can't be undone.`}
      />
    </>
  );
}
