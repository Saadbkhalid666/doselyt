import { useState } from 'react';
import { Sun, Moon, Monitor, Download, Upload } from 'lucide-react';
import PageHeading from '../components/shared/PageHeading.jsx';
import Button from '../components/shared/Button.jsx';
import { Field, TextInput, SelectInput, Toggle } from '../components/shared/Form.jsx';

function Section({ title, description, children }) {
  return (
    <section className="rounded-lg border border-line bg-surface shadow-card">
      <header className="border-b border-line px-5 py-4">
        <h2 className="text-sm font-medium">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ToggleRow({ label, description, defaultChecked }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted">{description}</p></div>
      <Toggle checked={on} onChange={setOn} label={label} />
    </div>
  );
}

const themes = [{ id: 'light', label: 'Light', icon: Sun }, { id: 'dark', label: 'Dark', icon: Moon }, { id: 'system', label: 'System', icon: Monitor }];

export default function Settings({ theme, onThemeChange }) {
  const [threshold, setThreshold] = useState(14);
  return (
    <div className="max-w-3xl">
      <PageHeading title="Settings" description="Preferences for how MedStock looks and behaves." />
      <div className="space-y-5">
        <Section title="Profile" description="How you appear in the app.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display name"><TextInput defaultValue="Personal workspace" /></Field>
            <Field label="Time zone"><SelectInput options={['Auto-detect', 'Asia/Karachi (UTC+5)', 'Europe/London (UTC+0)', 'America/New_York (UTC−5)']} /></Field>
            <Field label="Time format"><SelectInput options={['24-hour', '12-hour']} /></Field>
            <Field label="First day of week"><SelectInput options={['Monday', 'Sunday', 'Saturday']} /></Field>
          </div>
        </Section>

        <Section title="Theme">
          <div className="grid grid-cols-3 gap-3">
            {themes.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => onThemeChange(id)} aria-pressed={theme === id}
                className={`flex flex-col items-center gap-2 rounded-lg border py-4 text-sm font-medium transition-colors ${theme === id ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-line text-muted hover:border-muted/50 hover:text-ink'}`}>
                <Icon className="h-5 w-5" strokeWidth={1.75} />{label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Notifications">
          <div className="divide-y divide-line">
            <ToggleRow label="Dose reminders" description="Notify me when a scheduled dose is due." defaultChecked />
            <ToggleRow label="Missed dose alerts" description="Tell me if a dose goes untaken." defaultChecked />
            <ToggleRow label="Refill alerts" description="Warn me when a medicine passes the threshold below." defaultChecked />
            <ToggleRow label="Weekly summary" description="A short adherence recap every Monday." defaultChecked={false} />
          </div>
        </Section>

        <Section title="Low-stock warning" description="Flag a medicine when its supply drops below this many days.">
          <div className="flex items-center gap-4">
            <input type="range" min={3} max={30} value={threshold} onChange={(e) => setThreshold(+e.target.value)} className="h-1.5 flex-1 accent-accent" aria-label="Low-stock threshold in days" />
            <span className="w-20 rounded-md border border-line px-3 py-1.5 text-center text-sm font-medium">{threshold} days</span>
          </div>
        </Section>

        <Section title="Backup & restore" description="Keep a copy of your medicines, doses and history.">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">Last backup: 9 Nov 2026, 21:40</p>
            <div className="flex gap-2"><Button icon={Upload}>Restore</Button><Button variant="primary" icon={Download}>Back up now</Button></div>
          </div>
        </Section>

        <Section title="About">
          <dl className="grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-3">
            <div><dt className="text-xs text-muted">Version</dt><dd className="mt-0.5 font-medium">0.1.0</dd></div>
            <div><dt className="text-xs text-muted">Build</dt><dd className="mt-0.5 font-medium">Frontend preview</dd></div>
            <div><dt className="text-xs text-muted">Data</dt><dd className="mt-0.5 font-medium">Mock data only</dd></div>
          </dl>
        </Section>
      </div>
    </div>
  );
}
