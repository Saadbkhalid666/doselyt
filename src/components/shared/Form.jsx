import { useState } from 'react';
import { Search, ChevronDown, X, Plus } from 'lucide-react';

export const inputCls =
  'h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted/70 transition-colors hover:border-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function TextInput(props) {
  return <input className={inputCls} {...props} />;
}

export function SelectInput({ options = [], className = '', ...rest }) {
  return (
    <div className="relative">
      <select className={`${inputCls} appearance-none pr-8 ${className}`} {...rest}>
        {options.map((o) => (typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted" />
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" strokeWidth={1.75} />
      <input type="search" value={value} onChange={onChange} placeholder={placeholder} className={`${inputCls} pl-9`} />
    </div>
  );
}

/** Segmented filter / tab control. Controlled: pass value + onChange. */
export function FilterTabs({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex rounded-md border border-line bg-subtle p-0.5 ${className}`} role="tablist">
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        const active = value === opt.value;
        return (
          <button key={opt.value} role="tab" aria-selected={active} onClick={() => onChange?.(opt.value)}
            className={`h-7 rounded px-3 text-xs font-medium transition-colors ${active ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink'}`}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange?.(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-line'}`}>
      <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-surface shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
  );
}

/** Scheduled-times chips. Local UI state only; call onChange to lift it. */
export function TimeChips({ initial = [], onChange }) {
  const [times, setTimes] = useState(initial);
  const [draft, setDraft] = useState('12:00');
  const update = (next) => { setTimes(next); onChange?.(next); };
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {times.map((t) => (
        <span key={t} className="inline-flex h-8 items-center gap-1 rounded-md border border-line bg-subtle pl-2.5 pr-1 text-sm">
          {t}
          <button type="button" aria-label={`Remove ${t}`} onClick={() => update(times.filter((x) => x !== t))} className="rounded p-1 text-muted hover:bg-line hover:text-ink">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input type="time" value={draft} onChange={(e) => setDraft(e.target.value)} className={`${inputCls} !h-8 !w-28`} aria-label="New time" />
      <button type="button" onClick={() => draft && !times.includes(draft) && update([...times, draft])}
        className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-accent hover:bg-accent/10">
        <Plus className="h-3.5 w-3.5" />Add time
      </button>
    </div>
  );
}
