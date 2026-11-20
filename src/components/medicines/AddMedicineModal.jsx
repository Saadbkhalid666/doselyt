
import { useEffect, useState } from "react";

import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";

import {
  Field,
  TextInput,
  SelectInput,
  TimeChips,
} from "../shared/Form.jsx";

import {
  frequencyOptions,
  formOptions,
  strengthUnits,
} from "../../data/mockData.js";

const priorities = [
  {
    value: "critical",
    label: "Critical",
    hint: "Never miss",
    dot: "bg-crit",
  },
  {
    value: "important",
    label: "Important",
    hint: "Take as scheduled",
    dot: "bg-warn",
  },
  {
    value: "additional",
    label: "Additional",
    hint: "Supplements & extras",
    dot: "bg-muted",
  },
];

// Identify syrup medicine.
const isSyrup = (form) =>
  String(form || "").toLowerCase().includes("syrup");

// Initial form values.
const getInitialForm = (medicine) => {
  const [strength, unit] =
    medicine?.strength?.split(" ") || ["", "mg"];

  return {
    name: medicine?.name || "",
    strength,
    unit,
    form: medicine?.form || "",
    stock: medicine?.stock ?? "",
    priority: medicine?.priority || "important",
    frequency: medicine?.frequency || "Once daily",
    quantityPerAdministration:
      medicine?.quantityPerAdministration ?? 1,
    scheduledTimes: medicine?.scheduledTimes || ["08:00"],
  };
};

const getValue = (value) =>
  value?.target ? value.target.value : value;

export default function AddMedicineModal({
  open,
  onClose,
  onSubmit,
  medicine,
}) {
  const [form, setForm] = useState(() =>
    getInitialForm(medicine)
  );

  // Reset form when opening or editing another medicine.
  useEffect(() => {
    if (open) {
      setForm(getInitialForm(medicine));
    }
  }, [open, medicine]);

  const updateField = (field, value) => {
    const nextValue = getValue(value);

    setForm((previous) => ({
      ...previous,
      [field]: nextValue,
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("Please enter a medicine name.");
      return;
    }

    const syrup = isSyrup(form.form);

    if (!syrup && Number(form.stock) < 0) {
      alert("Stock cannot be negative.");
      return;
    }

    if (
      !syrup &&
      Number(form.quantityPerAdministration) <= 0
    ) {
      alert(
        "Quantity per administration must be greater than 0."
      );
      return;
    }

    const now = new Date().toISOString();

    const medicineData = {
      id: medicine?.id || crypto.randomUUID(),

      name: form.name.trim(),

      strength: `${form.strength} ${form.unit}`.trim(),

      form: form.form,

      priority: form.priority,

      frequency: form.frequency,

      scheduledTimes: form.scheduledTimes,

      createdAt: medicine?.createdAt || now,

      updatedAt: now,

      // Syrups do not track stock or quantity.
      ...(syrup
        ? {}
        : {
            stock: Number(form.stock) || 0,
            quantityPerAdministration:
              Number(form.quantityPerAdministration) || 1,
          }),
    };

    onSubmit?.(medicineData);
  };

  const syrup = isSyrup(form.form);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={medicine ? "Edit medicine" : "Add medicine"}
      description="Register a medicine once, then use it in schedules and dose regimens."
      footer={
        <>
          <Button onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
          >
            {medicine ? "Save changes" : "Add medicine"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Medicine Name */}
        <Field
          label="Medicine name"
          className="sm:col-span-2"
        >
          <TextInput
            placeholder="e.g. Amlodipine"
            value={form.name}
            onChange={(e) =>
              updateField("name", e)
            }
          />
        </Field>

        {/* Strength */}
        <Field label="Strength">
          <TextInput
            type="number"
            placeholder="5"
            value={form.strength}
            onChange={(e) =>
              updateField("strength", e)
            }
          />
        </Field>

        {/* Strength Unit */}
        <Field label="Unit">
          <SelectInput
            options={strengthUnits}
            value={form.unit}
            onChange={(e) =>
              updateField("unit", e)
            }
          />
        </Field>

        {/* Medicine Form */}
        <Field label="Form">
          <SelectInput
            options={formOptions}
            value={form.form}
            onChange={(e) =>
              updateField("form", e)
            }
          />
        </Field>

        {/* Stock - Hidden for syrups */}
        {!syrup && (
          <Field
            label="Current stock"
            hint="Units on hand"
          >
            <TextInput
              type="number"
              placeholder="30"
              value={form.stock}
              onChange={(e) =>
                updateField("stock", e)
              }
            />
          </Field>
        )}

        {/* Priority */}
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">
            Priority
          </span>

          <div className="grid grid-cols-3 gap-2">
            {priorities.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() =>
                  updateField("priority", p.value)
                }
                aria-pressed={form.priority === p.value}
                className={`rounded-md border p-2.5 text-left transition-colors ${
                  form.priority === p.value
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-line hover:border-muted/50"
                }`}
              >
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${p.dot}`}
                  />
                  {p.label}
                </span>

                <span className="mt-0.5 hidden text-xs text-muted sm:block">
                  {p.hint}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <Field label="Administration frequency">
          <SelectInput
            options={frequencyOptions}
            value={form.frequency}
            onChange={(e) =>
              updateField("frequency", e)
            }
          />
        </Field>

        {/* Quantity - Hidden for syrups */}
        {!syrup && (
          <Field label="Quantity per administration">
            <TextInput
              type="number"
              placeholder="1"
              value={form.quantityPerAdministration}
              onChange={(e) =>
                updateField(
                  "quantityPerAdministration",
                  e
                )
              }
            />
          </Field>
        )}

        {/* Scheduled Times */}
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">
            Scheduled times
          </span>

          <TimeChips
            initial={form.scheduledTimes}
            onChange={(value) =>
              updateField("scheduledTimes", value)
            }
          />
        </div>

      </div>
    </Modal>
  );
}
