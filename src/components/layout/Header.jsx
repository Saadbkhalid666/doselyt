import { Bell, Moon, Sun, Search } from 'lucide-react';
import { IconButton } from '../shared/Button.jsx';
import { Logo } from './Sidebar.jsx';

export default function Header({ pageLabel, date, isDark, onToggleTheme, profile }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="lg:hidden"><Logo /></div>
      <div className="hidden items-center gap-2 text-sm lg:flex">
        <span className="text-muted">MedStock</span>
        <span className="text-line">/</span>
        <span className="font-medium">{pageLabel}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="mr-2 hidden text-sm text-muted md:block">{date}</span>
        <button className="mr-1 hidden h-8 w-56 items-center gap-2 rounded-md border border-line bg-surface px-2.5 text-sm text-muted transition-colors hover:border-muted/50 xl:flex">
          <Search className="h-3.5 w-3.5" />Search…
          <kbd className="ml-auto rounded border border-line px-1.5 text-[10px]">⌘K</kbd>
        </button>
        <IconButton icon={isDark ? Sun : Moon} label="Toggle theme" onClick={onToggleTheme} />
        <span className="relative">
          <IconButton icon={Bell} label="Notifications" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-crit" />
        </span>
        <span className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-subtle text-xs font-medium lg:hidden">{profile.initials}</span>
      </div>
    </header>
  );
}
