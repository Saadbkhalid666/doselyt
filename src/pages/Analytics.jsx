import { useState } from 'react';
import { Download } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import PageHeading from '../components/shared/PageHeading.jsx';
import Button from '../components/shared/Button.jsx';
import { FilterTabs } from '../components/shared/Form.jsx';
import ChartCard, { ChartTooltip } from '../components/shared/ChartCard.jsx';
import { Skeleton } from '../components/shared/Skeleton.jsx';
import AdherenceCard from '../components/analytics/AdherenceCard.jsx';
import RefillHistory from '../components/analytics/RefillHistory.jsx';
import useSimulatedLoad from '../hooks/useSimulatedLoad.js';
import { consumptionTrend, inventoryHistory, adherence, weeklyCompletion, monthlyOverview, refillHistory } from '../data/mockData.js';

const margin = { top: 4, right: 4, left: -16, bottom: 0 };
const axis = { tickLine: false, axisLine: false };
const legend = { iconType: 'circle', iconSize: 8, verticalAlign: 'top', align: 'right', height: 28 };
const cursor = { fill: 'rgb(161 161 170 / 0.12)' };

export default function Analytics() {
  const loading = useSimulatedLoad();
  const [range, setRange] = useState('30d');

  return (
    <>
      <PageHeading title="Analytics" description="Consumption, stock and adherence over time."
        actions={<>
          <FilterTabs value={range} onChange={setRange} options={[{ value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: '90d', label: '90 days' }]} />
          <Button icon={Download} className="hidden sm:inline-flex">Export</Button>
        </>} />

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-lg lg:col-span-2" /><Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" /><Skeleton className="h-72 rounded-lg lg:col-span-2" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <ChartCard className="lg:col-span-2" title="Medicine consumption" description="Units taken per week" height={260}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consumptionTrend} margin={margin}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="week" {...axis} /><YAxis {...axis} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend {...legend} />
                  <Line type="monotone" dataKey="inograf" name="Inograf" stroke="#14b8a6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="moflat" name="Moflat" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="other" name="Others" stroke="#a1a1aa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <AdherenceCard data={adherence} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard title="Inventory history" description="Total units on hand at month end" height={240}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inventoryHistory} margin={margin}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" {...axis} /><YAxis {...axis} />
                  <Tooltip content={<ChartTooltip unit=" units" />} />
                  <Area type="monotone" dataKey="stock" name="On hand" stroke="#14b8a6" strokeWidth={2} fill="#14b8a6" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Completed vs pending" description="Administrations this week" height={240}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyCompletion} margin={margin}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" {...axis} /><YAxis {...axis} />
                  <Tooltip content={<ChartTooltip />} cursor={cursor} />
                  <Legend {...legend} />
                  <Bar dataKey="completed" name="Completed" stackId="a" fill="#14b8a6" barSize={18} />
                  <Bar dataKey="pending" name="Pending" stackId="a" fill="#a1a1aa" fillOpacity={0.5} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            <ChartCard className="lg:col-span-2" title="Monthly overview" description="Taken and missed administrations" height={240}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyOverview} margin={margin}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" {...axis} /><YAxis {...axis} />
                  <Tooltip content={<ChartTooltip />} cursor={cursor} />
                  <Legend {...legend} />
                  <Bar dataKey="taken" name="Taken" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="missed" name="Missed" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <div className="lg:col-span-3"><RefillHistory items={refillHistory} /></div>
          </div>
        </div>
      )}
    </>
  );
}
