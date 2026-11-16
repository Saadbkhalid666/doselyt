import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import Button from '../shared/Button.jsx';
import { Field, TextInput, SelectInput, TimeChips } from '../shared/Form.jsx';
import { frequencyOptions, formOptions, strengthUnits } from '../../data/mockData.js';

const priorities = [
  { value: 'critical', label: 'Critical', hint: 'Never miss', dot: 'bg-crit' },
  { value: 'important', label: 'Important', hint: 'Take as scheduled', dot: 'bg-warn' },
  { value: 'additional', label: 'Additional', hint: 'Supplements & extras', dot: 'bg-muted' },
];

/** Visual form only: no validation, no persistence. Pass `medicine` to prefill for editing. */
export default function AddMedicineModal({ open, onClose, onSubmit, medicine }) {
  const m = medicine;
  const [priority, setPriority] = useState(m?.priority || 'important');
  const [strengthValue, strengthUnit] = m ? m.strength.split(' ') : ['', 'mg'];
  const [form, setForm] = useState({
    name: "",
    strength: "",
    unit: "",
    form: "",
    stock: "",
    priority: "",
    frequency: "",
    quantityPerAdministration: "",
    scheduledTimes: []
  });


  return (
    <Modal open={open} onClose={onClose} size="md"
      title={m ? 'Edit medicine' : 'Add medicine'}
      description="Register a medicine once, then use it in schedules and dose regimens."
      footer={<>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => onSubmit?.()}>{m ? 'Save changes' : 'Add medicine'}</Button>
      </>}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Medicine name" className="sm:col-span-2"><TextInput placeholder="e.g. Amlodipine" defaultValue={m?.name} /></Field>
        <Field label="Strength"><TextInput type="number" placeholder="5" defaultValue={strengthValue} /></Field>
        <Field label="Unit"><SelectInput options={strengthUnits} defaultValue={strengthUnit} /></Field>
        <Field label="Form"><SelectInput options={formOptions} defaultValue={m?.form} /></Field>
        <Field label="Current stock" hint="Units on hand"><TextInput type="number" placeholder="30" defaultValue={m?.stock} /></Field>

        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Priority</span>
          <div className="grid grid-cols-3 gap-2">
            {priorities.map((p) => (
              <button key={p.value} type="button" onClick={() => setPriority(p.value)} aria-pressed={priority === p.value}
                className={`rounded-md border p-2.5 text-left transition-colors ${priority === p.value ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-line hover:border-muted/50'}`}>
                <span className="flex items-center gap-1.5 text-sm font-medium"><span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />{p.label}</span>
                <span className="mt-0.5 hidden text-xs text-muted sm:block">{p.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <Field label="Administration frequency"><SelectInput options={frequencyOptions} defaultValue="Once daily" /></Field>
        <Field label="Quantity per administration"><TextInput type="number" placeholder="1" defaultValue={1} /></Field>
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Scheduled times</span>
          <TimeChips initial={['08:00']} />
        </div>
      </div>
    </Modal>
  );
}
