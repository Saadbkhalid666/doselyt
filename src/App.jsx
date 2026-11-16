import { useState } from 'react';
import Sidebar from './components/layout/Sidebar.jsx';
import Header from './components/layout/Header.jsx';
import MobileNav from './components/layout/MobileNav.jsx';
import { navItems } from './components/layout/navItems.js';
import Dashboard from './pages/Dashboard.jsx';
import Medicines from './pages/Medicines.jsx';
import Doses from './pages/Doses.jsx';
import Analytics from './pages/Analytics.jsx';
import Settings from './pages/Settings.jsx';
import useTheme from './hooks/useTheme.js';
import { profile, todayLabel } from './data/mockData.js';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const { theme, setTheme } = useTheme('system');
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const label = navItems.find((n) => n.id === page).label;

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} />,
    medicines: <Medicines />,
    doses: <Doses />,
    analytics: <Analytics />,
    settings: <Settings theme={theme} onThemeChange={setTheme} />,
  };

  return (
    <div className="min-h-screen">
      <Sidebar current={page} onNavigate={setPage} profile={profile} />
      <div className="lg:pl-60">
        <Header pageLabel={label} date={todayLabel} profile={profile} isDark={isDark}
          onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')} />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">{pages[page]}</main>
      </div>
      <MobileNav current={page} onNavigate={setPage} />
    </div>
  );
}
