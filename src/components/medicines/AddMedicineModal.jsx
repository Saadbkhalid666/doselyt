
import { useEffect, useState } from "react";

import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";

import {
  Field,
  TextInput,
  SelectInput,
} from "../shared/Form.jsx";

import {
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

const isSyrup = (form) =>
  String(form || "").toLowerCase().includes("syrup");

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
    const stock = Number(form.stock);

    if (
      !syrup &&
      (!Number.isFinite(stock) || stock < 0)
    ) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    const now = new Date().toISOString();

    const medicineData = {
      id: medicine?.id || crypto.randomUUID(),

      name: form.name.trim(),

      strength: `${form.strength} ${form.unit}`.trim(),

      form: form.form,

      priority: form.priority,

      createdAt: medicine?.createdAt || now,
      updatedAt: now,

      ...(syrup
        ? {}
        : {
            stock,
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
      description="Register a medicine and manage its available inventory."
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

        <Field
          label="Medicine name"
          className="sm:col-span-2"
        >
          <TextInput
            placeholder="e.g. Mofetyl"
            value={form.name}
            onChange={(value) =>
              updateField("name", value)
            }
          />
        </Field>

        <Field label="Strength">
          <TextInput
            type="number"
            placeholder="500"
            value={form.strength}
            onChange={(value) =>
              updateField("strength", value)
            }
          />
        </Field>

        <Field label="Unit">
          <SelectInput
            options={strengthUnits}
            value={form.unit}
            onChange={(value) =>
              updateField("unit", value)
            }
          />
        </Field>

        <Field label="Form">
          <SelectInput
            options={formOptions}
            value={form.form}
            onChange={(value) =>
              updateField("form", value)
            }
          />
        </Field>

        {!syrup && (
          <Field
            label="Current stock"
            hint="Total units currently available"
          >
            <TextInput
              type="number"
              placeholder="90"
              value={form.stock}
              onChange={(value) =>
                updateField("stock", value)
              }
            />
          </Field>
        )}

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

      </div>
    </Modal>
  );
}
