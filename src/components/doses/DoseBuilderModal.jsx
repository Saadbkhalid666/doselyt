import { useEffect, useMemo, useState } from "react";
import { Info, Pill, Plus, Trash2 } from "lucide-react";
import Modal from "../shared/Modal.jsx";
import Button, { IconButton } from "../shared/Button.jsx";
import { Field, TextInput, SelectInput } from "../shared/Form.jsx";
import { normalizeDose } from "../../utils/medicine.js";

const getValue = (value) => value?.target ? value.target.value : value;

export default function DoseBuilderModal({ open, onClose, onSubmit, medicines = [], initialDose }) {
  const [name, setName] = useState("");
  const [medicineIds, setMedicineIds] = useState([]);
  const [pick, setPick] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(initialDose?.name || "");
    setMedicineIds(initialDose ? normalizeDose(initialDose).medicines.map((item) => item.medicineId) : []);
    setPick(medicines[0]?.id || "");
  }, [open, initialDose, medicines]);

  const available = useMemo(
    () => medicines.filter((medicine) => !medicineIds.includes(medicine.id)),
    [medicines, medicineIds]
  );
  const selected = available.find((medicine) => medicine.id === pick) || available[0] || null;
  const selectedMedicines = medicineIds.map((id) => medicines.find((medicine) => medicine.id === id)).filter(Boolean);

  const addMedicine = () => {
    if (!selected) return;
    setMedicineIds((prev) => [...prev, selected.id]);
    setPick("");
  };

  const submit = () => {
    if (!name.trim()) return alert("Please enter a dose name.");
    if (!medicineIds.length) return alert("Please select at least one medicine.");
    const now = new Date().toISOString();
    onSubmit?.({
      id: initialDose?.id || crypto.randomUUID(),
      name: name.trim(),
      medicines: medicineIds.map((medicineId) => ({ medicineId })),
      createdAt: initialDose?.createdAt || now,
      updatedAt: now,
    });
  };

  const fill = medicines.length ? Math.round((medicineIds.length / medicines.length) * 100) : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initialDose ? "Update dose" : "Create dose"}
      description="A dose is a named group of medicines from your inventory."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={!name.trim() || medicineIds.length === 0}>
            {initialDose ? "Save changes" : "Create dose"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Dose name">
          <TextInput value={name} placeholder="e.g. Daily medication" onChange={(v) => setName(getValue(v))} />
        </Field>

        <div className="flex gap-3 rounded-xl bg-indigo-500/10 px-4 py-3 text-xs text-indigo-700 dark:text-indigo-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Dosage and administration times are managed in My Medicines. Updating a medicine there updates every dose that references it.
        </div>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Medicines in this dose</h3>
            <span className="text-xs text-muted">{medicineIds.length} of {medicines.length} selected</span>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-subtle">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-[width] duration-500" style={{ width: `${fill}%` }} />
          </div>

          {selectedMedicines.length ? (
            <ul className="space-y-2">
              {selectedMedicines.map((medicine) => (
                <li key={medicine.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Pill className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{medicine.name} <span className="font-normal text-muted">{medicine.strength} · {medicine.form}</span></p>
                      <p className="mt-0.5 text-xs text-muted">Schedule is managed in My Medicines</p>
                    </div>
                  </div>
                  <IconButton icon={Trash2} label={`Remove ${medicine.name}`} className="hover:!text-crit" onClick={() => setMedicineIds((prev) => prev.filter((id) => id !== medicine.id))} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">No medicines selected yet. Pick one below to start this dose.</p>
          )}
        </section>

        <div className="flex flex-col gap-2 rounded-2xl bg-subtle/40 p-3 ring-1 ring-inset ring-line sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            {available.length ? (
              <SelectInput
                aria-label="Select a medicine"
                value={selected?.id || ""}
                options={available.map((medicine) => ({ value: medicine.id, label: `${medicine.name} ${medicine.strength} · ${medicine.form}` }))}
                onChange={(v) => setPick(getValue(v))}
              />
            ) : (
              <p className="py-2 text-sm text-muted">{medicines.length ? "All inventory medicines are selected." : "Add medicines in My Medicines first."}</p>
            )}
          </div>
          <Button variant="accent" icon={Plus} onClick={addMedicine} disabled={!selected}>Add medicine</Button>
        </div>
      </div>
    </Modal>
  );
}
