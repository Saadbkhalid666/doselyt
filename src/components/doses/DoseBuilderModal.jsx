import { useState } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import Modal from '../shared/Modal.jsx';
import Button, { IconButton } from '../shared/Button.jsx';
import { Field, TextInput, SelectInput, TimeChips } from '../shared/Form.jsx';
import { frequencyOptions } from '../../data/mockData.js';

/**
 * Dose builder. `medicines` = your registered medicines (the selector source).
 * `initialDose` prefills the form. Add/remove below only edits the local list shown in the UI;
 * lift it into your own state through onSubmit when you wire real logic.
 */
export default function DoseBuilderModal({ open, onClose, onSubmit, medicines = [], initialDose }) {
  const [items, setItems] = useState(initialDose?.medicines || []);
  const [picking, setPicking] = useState(!(initialDose?.medicines?.length));
  const [pick, setPick] = useState(medicines[0]?.id);

  const available = medicines.filter((m) => !items.some((i) => i.medicineId === m.id));
  const selected = available.find((m) => m.id === pick) || available[0];

  const addItem = () => {
    if (!selected) return;
    setItems([...items, { medicineId: selected.id, name: selected.name, strength: selected.strength, form: selected.form, quantity: '1', frequency: 'Once daily', times: ['08:00'] }]);
    setPicking(false);
  };

  return (
    <Modal open={open} onClose={onClose} size="lg"
      title={initialDose ? 'Edit dose' : 'Make a dose'}
      description="Combine medicines you already track into one named regimen."
      footer={<>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => onSubmit?.(items)}>{initialDose ? 'Save dose' : 'Create dose'}</Button>
      </>}>
      <div className="space-y-5">
        <Field label="Dose name"><TextInput placeholder="e.g. Daily Medication Regimen" defaultValue={initialDose?.name} /></Field>

        <div className="flex gap-2.5 rounded-md bg-subtle/70 px-3 py-2.5 text-xs text-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          A dose only references medicines from My Medicines. It never creates separate inventory records.
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">Medicines in this dose</h3>
            <span className="text-xs text-muted">{items.length} selected</span>
          </div>

          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.medicineId} className="rounded-lg border border-line p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">{it.name} <span className="font-normal text-muted">{it.strength} · {it.form}</span></p>
                  <IconButton icon={Trash2} label={`Remove ${it.name} ${it.strength}`} className="hover:!text-crit"
                    onClick={() => setItems(items.filter((x) => x.medicineId !== it.medicineId))} />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Quantity per administration"><TextInput type="number" defaultValue={parseInt(it.quantity, 10) || 1} /></Field>
                  <Field label="Frequency"><SelectInput options={frequencyOptions} defaultValue={it.frequency} /></Field>
                  <div className="sm:col-span-2">
                    <span className="mb-1.5 block text-sm font-medium">Scheduled times</span>
                    <TimeChips initial={it.times} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {picking ? (
            <div className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-line p-3 sm:flex-row">
              <div className="flex-1">
                <SelectInput aria-label="Select a medicine" value={selected?.id || ''} onChange={(e) => setPick(e.target.value)}
                  options={available.length ? available.map((m) => ({ value: m.id, label: `${m.name} ${m.strength} · ${m.form}` })) : [{ value: '', label: 'All medicines added' }]} />
              </div>
              <div className="flex gap-2">
                <Button variant="accent" icon={Plus} onClick={addItem} disabled={!selected}>Add</Button>
                {items.length > 0 && <Button variant="ghost" onClick={() => setPicking(false)}>Cancel</Button>}
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setPicking(true)}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent">
              <Plus className="h-4 w-4" />Add another medicine
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
