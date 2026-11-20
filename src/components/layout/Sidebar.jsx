import { Pill } from 'lucide-react';
import { navItems } from './navItems.js';

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-bg"><Pill className="h-4 w-4 -rotate-45" strokeWidth={2} /></span>
      <span className="text-[15px] font-semibold tracking-tight">Doselyt</span>
    </div>
  );
}

export default function Sidebar({ current, onNavigate, profile }) {
  const setting = JSON.parse(localStorage.getItem("doselyt_settings"));
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-14 items-center border-b border-line px-5"><Logo /></div>
      <nav className="flex-1 space-y-0.5 p-3" aria-label="Main">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = current === id;
          return (
            <button key={id} onClick={() => onNavigate(id)} aria-current={active ? 'page' : undefined}
              className={`flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors ${active ? 'bg-subtle text-ink' : 'text-muted hover:bg-subtle/70 hover:text-ink'}`}>
              <Icon className={`h-4 w-4 ${active ? 'text-accent' : ''}`} strokeWidth={1.75} />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-subtle text-xs font-medium">{setting.displayName?.charAt(0).toUpperCase()}</span>
          <span className="truncate text-sm text-muted">{setting.displayName ? setting.displayName : "Unknown"}</span>
        </div>
      </div>
    </aside>
  );
}
