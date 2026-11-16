import { Pill, CalendarClock, CheckCircle2, PackageOpen } from 'lucide-react';
import PageHeading from '../components/shared/PageHeading.jsx';
import StatCard from '../components/shared/StatCard.jsx';
import { StatsSkeleton, Skeleton } from '../components/shared/Skeleton.jsx';
import ScheduleSection from '../components/dashboard/ScheduleSection.jsx';
import RefillAlerts from '../components/dashboard/RefillAlerts.jsx';
import InventoryOverview from '../components/dashboard/InventoryOverview.jsx';
import InventoryChart from '../components/dashboard/InventoryChart.jsx';
import useSimulatedLoad from '../hooks/useSimulatedLoad.js';
import { dashboardStats, todaySchedule, refillAlerts, medicines, inventoryTrend, todayLabel } from '../data/mockData.js';

const statIcons = { total: Pill, daily: CalendarClock, completed: CheckCircle2, refills: PackageOpen };

// Wire these to your own logic.
const handleTaken = (item) => console.log('Mark as taken', item);
const handleRefill = (alert) => console.log('Refill', alert);

export default function Dashboard({ onNavigate }) {
  const loading = useSimulatedLoad();
  return (
    <>
      <PageHeading title="Dashboard" description={`${todayLabel}. Here's what's on for today.`} />
      {loading ? (
        <div className="space-y-6">
          <StatsSkeleton />
          <div className="grid gap-6 xl:grid-cols-3"><Skeleton className="h-96 rounded-lg xl:col-span-2" /><Skeleton className="h-96 rounded-lg" /></div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {dashboardStats.map((s) => <StatCard key={s.id} {...s} icon={statIcons[s.id]} />)}
          </div>
          <div className="grid items-start gap-8 xl:grid-cols-3">
            <div className="xl:col-span-2"><ScheduleSection groups={todaySchedule} onTaken={handleTaken} /></div>
            <div className="space-y-6">
              <RefillAlerts alerts={refillAlerts} onRefill={handleRefill} />
              <InventoryOverview medicines={medicines.slice(0, 6)} onViewAll={() => onNavigate('medicines')} />
            </div>
          </div>
          <InventoryChart data={inventoryTrend} />
        </div>
      )}
    </>
  );
}
