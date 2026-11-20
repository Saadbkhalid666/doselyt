
import { useEffect, useState } from "react";
import { Plus, Trash2, Info } from "lucide-react";

import Modal from "../shared/Modal.jsx";
import Button, { IconButton } from "../shared/Button.jsx";

import {
  Field,
  TextInput,
  SelectInput,
  TimeChips,
} from "../shared/Form.jsx";

import { frequencyOptions } from "../../data/mockData.js";

const getValue = (value) =>
  value?.target ? value.target.value : value;

export default function DoseBuilderModal({
  open,
  onClose,
  onSubmit,
  medicines = [],
  initialDose,
}) {
  const [doseName, setDoseName] = useState("");
  const [items, setItems] = useState([]);
  const [picking, setPicking] = useState(true);
  const [pick, setPick] = useState("");

  // Initialize when opening or switching between doses.
  useEffect(() => {
    if (!open) return;

    setDoseName(initialDose?.name || "");

    setItems(
      (initialDose?.medicines || []).map((item) => ({
        ...item,
        quantity: Number(item.quantity) || 1,
        times: Array.isArray(item.times) ? [...item.times] : [],
      }))
    );

    setPicking(!initialDose?.medicines?.length);

    setPick(medicines[0]?.id || "");
  }, [open, initialDose]);

  // Only medicines not already added can be selected.
  const available = medicines.filter(
    (medicine) =>
      !items.some(
        (item) => item.medicineId === medicine.id
      )
  );

  const selected =
    available.find((medicine) => medicine.id === pick) ||
    available[0] ||
    null;

  // Add a medicine from the actual inventory.
  const addItem = () => {
    if (!selected) return;

    const newItem = {
      medicineId: selected.id,
      name: selected.name,
      strength: selected.strength,
      form: selected.form,
      quantity:
        Number(selected.quantityPerAdministration) || 1,
      frequency: selected.frequency || "Once daily",
      times:
        selected.scheduledTimes?.length
          ? [...selected.scheduledTimes]
          : ["08:00"],
    };

    setItems((previous) => [...previous, newItem]);

    setPicking(false);
    setPick("");
  };

  // Update an individual medicine's regimen.
  const updateItem = (medicineId, field, value) => {
    setItems((previous) =>
      previous.map((item) =>
        item.medicineId === medicineId
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // Remove medicine from the dose only.
  const removeItem = (medicineId) => {
    setItems((previous) =>
      previous.filter(
        (item) => item.medicineId !== medicineId
      )
    );
  };

  // Save dose.
  const handleSubmit = () => {
    if (!doseName.trim()) {
      alert("Please enter a dose name.");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one medicine.");
      return;
    }

    const invalidItem = items.find(
      (item) =>
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0 ||
        !Array.isArray(item.times) ||
        item.times.length === 0 ||
        !medicines.some(
          (medicine) => medicine.id === item.medicineId
        )
    );

    if (invalidItem) {
      alert(
        `Please check the quantity, scheduled times, and inventory for ${invalidItem.name}.`
      );
      return;
    }

    const now = new Date().toISOString();

    const doseData = {
      id: initialDose?.id || crypto.randomUUID(),
      name: doseName.trim(),

      medicines: items.map((item) => {
        const inventoryMedicine = medicines.find(
          (medicine) => medicine.id === item.medicineId
        );

        return {
          medicineId: inventoryMedicine.id,
          name: inventoryMedicine.name,
          strength: inventoryMedicine.strength,
          form: inventoryMedicine.form,
          quantity: Number(item.quantity),
          frequency: item.frequency,
          times: [...item.times],
        };
      }),

      createdAt: initialDose?.createdAt || now,
      updatedAt: now,
    };

    onSubmit?.(doseData);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initialDose ? "Edit dose" : "Make a dose"}
      description="Combine medicines you already track into one named regimen."
      footer={
        <>
          <Button onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={items.length === 0 || !doseName.trim()}
          >
            {initialDose ? "Save dose" : "Create dose"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">

        <Field label="Dose name">
          <TextInput
            placeholder="e.g. Daily Medication Regimen"
            value={doseName}
            onChange={(value) => setDoseName(getValue(value))}
          />
        </Field>

        <div className="flex gap-2.5 rounded-md bg-subtle/70 px-3 py-2.5 text-xs text-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />

          This dose references medicines from My Medicines.
          Removing a medicine from this dose does not delete
          it from your inventory.
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Medicines in this dose
            </h3>

            <span className="text-xs text-muted">
              {items.length} selected
            </span>
          </div>

          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.medicineId}
                className="rounded-lg border border-line p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {item.name}{" "}
                      <span className="font-normal text-muted">
                        {item.strength} · {item.form}
                      </span>
                    </p>

                    {!medicines.some(
                      (medicine) => medicine.id === item.medicineId
                    ) && (
                      <p className="mt-1 text-xs text-crit">
                        This medicine is no longer in My Medicines.
                        Remove it to continue.
                      </p>
                    )}
                  </div>

                  <IconButton
                    icon={Trash2}
                    label={`Remove ${item.name}`}
                    className="hover:!text-crit"
                    onClick={() => removeItem(item.medicineId)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <Field label="Quantity per administration">
                    <TextInput
                      type="number"
                      min="1"
                      value={String(item.quantity)}
                      onChange={(value) =>
                        updateItem(
                          item.medicineId,
                          "quantity",
                          getValue(value)
                        )
                      }
                    />
                  </Field>

                  <Field label="Frequency">
                    <SelectInput
                      options={frequencyOptions}
                      value={item.frequency}
                      onChange={(value) =>
                        updateItem(
                          item.medicineId,
                          "frequency",
                          getValue(value)
                        )
                      }
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <span className="mb-1.5 block text-sm font-medium">
                      Scheduled times
                    </span>

                    <TimeChips
                      initial={item.times}
                      onChange={(times) =>
                        updateItem(
                          item.medicineId,
                          "times",
                          times
                        )
                      }
                    />
                  </div>

                </div>
              </li>
            ))}
          </ul>

          {picking ? (
            <div className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-line p-3 sm:flex-row">
              <div className="flex-1">
                {available.length > 0 ? (
                  <SelectInput
                    aria-label="Select a medicine"
                    value={selected?.id || ""}
                    onChange={(value) => setPick(getValue(value))}
                    options={available.map((medicine) => ({
                      value: medicine.id,
                      label: `${medicine.name} ${medicine.strength} · ${medicine.form}`,
                    }))}
                  />
                ) : (
                  <p className="py-2 text-sm text-muted">
                    {medicines.length === 0
                      ? "No medicines found. Add medicines in My Medicines first."
                      : "All available medicines have been added."}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="accent"
                  icon={Plus}
                  onClick={addItem}
                  disabled={!selected}
                >
                  Add
                </Button>

                {items.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => setPicking(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ) : (
            available.length > 0 && (
              <button
                type="button"
                onClick={() => setPicking(true)}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <Plus className="h-4 w-4" />
                Add another medicine
              </button>
            )
          )}
        </div>
      </div>
    </Modal>
  );
}
