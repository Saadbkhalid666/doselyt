import { useEffect, useMemo, useState } from "react";
import { Clock3, Info, Zap } from "lucide-react";
import Modal from "../shared/Modal.jsx";
import Button from "../shared/Button.jsx";
import { Field, TextInput, SelectInput, TimeChips } from "../shared/Form.jsx";
import { StockBar, DayTimeline, TONES, getTone } from "../shared/StockBar.jsx";
import { getSchedule, isSyrup } from "../../utils/medicine.js";
import { FREQUENCY_OPTIONS, getFrequency } from "../../utils/frequency.js";

const getValue = (value) => value?.target ? value.target.value : value;
const formOptions = [
  { value: "Tablet", label: "Tablet" },
  { value: "Capsule", label: "Capsule" },
  { value: "Syrup", label: "Syrup" },
  { value: "Injection", label: "Injection" },
  { value: "Other", label: "Other" },
];
const priorityOptions = [
  { value: "critical", label: "Critical", dot: "bg-rose-500", active: "ring-rose-500/60 bg-rose-500/10" },
  { value: "important", label: "Important", dot: "bg-amber-500", active: "ring-amber-500/60 bg-amber-500/10" },
  { value: "additional", label: "Additional", dot: "bg-sky-500", active: "ring-sky-500/60 bg-sky-500/10" },
];

export default function AddMedicineModal({ open, medicine, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "", strength: "", form: "Tablet", stock: "0", priority: "important",
    frequency: "daily", perUse: "1",
  });
  const [times, setTimes] = useState(["08:00"]);
  const [quantities, setQuantities] = useState({ "08:00": "1" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const hasSchedule = medicine && getFrequency(medicine) !== "asNeeded" && !isSyrup(medicine);
    const currentSchedule = hasSchedule ? getSchedule(medicine) : [{ time: "08:00", quantity: 1 }];
    setForm({
      name: medicine?.name || "",
      strength: medicine?.strength || "",
      form: medicine?.form || "Tablet",
      stock: medicine?.stock == null ? "0" : String(medicine.stock),
      priority: medicine?.priority || "important",
      frequency: getFrequency(medicine),
      perUse: medicine?.perUse == null ? "1" : String(medicine.perUse),
    });
    setTimes(currentSchedule.map((item) => item.time));
    setQuantities(Object.fromEntries(currentSchedule.map((item) => [item.time, String(item.quantity || 1)])));
    setError("");
  }, [open, medicine]);

  const syrup = useMemo(() => isSyrup({ form: form.form }), [form.form]);
  const asNeeded = form.frequency === "asNeeded";
  const alternate = form.frequency === "alternate";

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: getValue(value) }));

  const handleTimesChange = (nextTimes) => {
    const safeTimes = Array.isArray(nextTimes) ? nextTimes : [];
    setTimes(safeTimes);
    setQuantities((prev) => Object.fromEntries(
      safeTimes.map((time) => [time, prev[time] ?? "1"])
    ));
  };

  const submit = () => {
    const name = form.name.trim();
    if (!name) return setError("Medicine name is required.");
    if (!form.strength.trim()) return setError("Strength is required.");
    if (!syrup && !asNeeded && times.length === 0) return setError("Add at least one administration time.");

    const schedule = asNeeded ? [] : times.map((time) => ({ time, quantity: Number(quantities[time]) }));
    const perUse = Number(form.perUse);
    if (!syrup && asNeeded && (!Number.isFinite(perUse) || perUse <= 0)) {
      return setError("Enter a valid quantity per use.");
    }
    if (!syrup && !asNeeded && schedule.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      return setError("Enter a valid quantity for every administration time.");
    }
    const stock = Number(form.stock);
    if (!syrup && (!Number.isFinite(stock) || stock < 0)) {
      return setError("Stock must be zero or greater.");
    }

    const now = new Date().toISOString();
    onSubmit?.({
      id: medicine?.id || crypto.randomUUID(),
      name,
      strength: form.strength.trim(),
      form: form.form,
      priority: form.priority,
      ...(syrup ? {} : { frequency: form.frequency, stock, schedule, ...(asNeeded ? { perUse } : {}) }),
      ...(medicine?.lastLoggedAt ? { lastLoggedAt: medicine.lastLoggedAt } : {}),
      createdAt: medicine?.createdAt || now,
      updatedAt: now,
    });
  };

  // Display-only preview values (the saved data still goes through submit above).
  const previewSchedule = times.map((time) => ({ time, quantity: Number(quantities[time]) || 0 }));
  const previewDaily = previewSchedule.reduce((sum, item) => sum + item.quantity, 0);
  const previewStock = Number(form.stock);
  const previewAverage = alternate ? previewDaily / 2 : previewDaily;
  const previewDays = previewAverage > 0 && Number.isFinite(previewStock) ? Math.floor(previewStock / previewAverage) : null;
  const previewTone = TONES[getTone(previewDays)];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={medicine ? "Update medicine" : "Add medicine"}
      description="Medicine details, administration schedule, and stock are managed here."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>{medicine ? "Save changes" : "Add medicine"}</Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <p role="alert" className="rounded-xl border border-crit/20 bg-crit/10 px-4 py-3 text-sm text-crit">{error}</p>}

        <section className="grid gap-3 sm:grid-cols-2">
          <Field label="Medicine name">
            <TextInput value={form.name} placeholder="e.g. Mofetyl" onChange={(v) => update("name", v)} />
          </Field>
          <Field label="Strength">
            <TextInput value={form.strength} placeholder="e.g. 500 mg" onChange={(v) => update("strength", v)} />
          </Field>
          <Field label="Form">
            <SelectInput value={form.form} options={formOptions} onChange={(v) => update("form", v)} />
          </Field>
          {!syrup && (
            <Field label="Current stock">
              <TextInput type="number" min="0" step="1" value={form.stock} onChange={(v) => update("stock", v)} />
            </Field>
          )}
        </section>

        <div>
          <p className="mb-2 text-sm font-medium">Priority</p>
          <div role="radiogroup" aria-label="Priority" className="grid grid-cols-3 gap-2">
            {priorityOptions.map((option) => {
              const active = form.priority === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => update("priority", option.value)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ring-1 ring-inset transition-colors focus:outline-none focus-visible:ring-2 ${
                    active ? `${option.active} text-ink` : "ring-line text-muted hover:bg-subtle/60"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${option.dot}`} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {!syrup && (
          <div>
            <p className="mb-2 text-sm font-medium">How often is it taken?</p>
            <div role="radiogroup" aria-label="Frequency" className="grid gap-2 sm:grid-cols-3">
              {FREQUENCY_OPTIONS.map((option) => {
                const active = form.frequency === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => update("frequency", option.value)}
                    className={`rounded-xl px-3 py-2.5 text-left ring-1 ring-inset transition-colors focus:outline-none focus-visible:ring-2 ${
                      active ? "bg-indigo-500/10 ring-indigo-500/60" : "ring-line hover:bg-subtle/60"
                    }`}
                  >
                    <span className={`block text-sm font-medium ${active ? "text-ink" : "text-muted"}`}>{option.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!syrup && asNeeded ? (
          <section className="space-y-4 rounded-2xl border border-line bg-subtle/30 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Zap className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">As-needed use</h3>
                <p className="mt-0.5 text-xs text-muted">No fixed times and no days-left forecast. Each time you log a dose, this quantity is taken from stock.</p>
              </div>
            </div>
            <div className="max-w-[200px]">
              <Field label="Quantity per use">
                <TextInput type="number" min="0.01" step="0.5" value={form.perUse} onChange={(v) => update("perUse", v)} />
              </Field>
            </div>
          </section>
        ) : !syrup ? (
          <section className="space-y-4 rounded-2xl border border-line bg-subtle/30 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Clock3 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">Administration schedule</h3>
                <p className="mt-0.5 text-xs text-muted">
                  {alternate ? "Set the quantity for each time on the days it is taken (every other day)." : "Set the quantity separately for each scheduled time."}
                </p>
              </div>
            </div>

            <Field label="Scheduled times">
              <TimeChips initial={times} onChange={handleTimesChange} />
            </Field>

            {times.length > 0 && (
              <div className="space-y-2">
                {times.map((time) => (
                  <div key={time} className="grid grid-cols-[1fr_130px] items-center gap-3 rounded-xl bg-surface px-3 py-2 ring-1 ring-inset ring-line">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      {time}
                    </span>
                    <Field label="Quantity">
                      <TextInput
                        type="number"
                        min="0.01"
                        step="0.5"
                        value={quantities[time] ?? "1"}
                        onChange={(v) => setQuantities((prev) => ({ ...prev, [time]: getValue(v) }))}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            )}

            {times.length > 0 && (
              <div className="space-y-4 rounded-xl bg-surface p-4 ring-1 ring-inset ring-line">
                <DayTimeline schedule={previewSchedule} />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted">{alternate ? "Per dose day" : "Daily consumption"}</p>
                    <p className="text-xl font-semibold leading-tight">{previewDaily} <span className="text-sm font-normal text-muted">units</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">Estimated coverage</p>
                    <p className={`text-xl font-semibold leading-tight ${previewTone.text}`}>{previewDays == null ? "—" : `${previewDays} days`}</p>
                  </div>
                </div>
                <StockBar days={previewDays} />
              </div>
            )}
          </section>
        ) : (
          <div className="flex gap-3 rounded-xl bg-subtle/70 px-4 py-3 text-xs text-muted">
            <Info className="h-4 w-4 shrink-0" />
            Syrup inventory and quantity forecasting are not tracked in this version.
          </div>
        )}
      </div>
    </Modal>
  );
}
