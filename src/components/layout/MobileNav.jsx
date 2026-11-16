import { navItems } from './navItems.js';

const short = { dashboard: 'Home', medicines: 'Medicines', doses: 'Doses', analytics: 'Analytics', settings: 'Settings' };

export default function MobileNav({ current, onNavigate }) {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <ul className="grid grid-cols-5">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = current === id;
          return (
            <li key={id}>
              <button onClick={() => onNavigate(id)} aria-label={label} aria-current={active ? 'page' : undefined}
                className={`flex h-14 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${active ? 'text-accent' : 'text-muted'}`}>
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                {short[id]}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
