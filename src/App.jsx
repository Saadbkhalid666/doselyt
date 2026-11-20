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
import { profile } from './data/mockData.js';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const { theme, setTheme } = useTheme('system');
  const label = navItems.find((n) => n.id === page).label;

function getTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

const todayLabel = getTodayLabel();

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
      <Header
  pageLabel={label}
  date={todayLabel}
  isDark={theme === "dark"}
  onToggleTheme={() =>
    setTheme(theme === "dark" ? "light" : "dark")
  }
  profile={{
    displayName:
      JSON.parse(localStorage.getItem("doselyt_settings") || "{}")
        .displayName || "Personal workspace",
  }}
/>
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">{pages[page]}</main>
      </div>
      <MobileNav current={page} onNavigate={setPage} />
    </div>
  );
}
