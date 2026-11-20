
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import PageHeading from "../components/shared/PageHeading.jsx";
import Button from "../components/shared/Button.jsx";
import { FilterTabs } from "../components/shared/Form.jsx";
import ChartCard, {
  ChartTooltip,
} from "../components/shared/ChartCard.jsx";
import { Skeleton } from "../components/shared/Skeleton.jsx";

import AdherenceCard from "../components/analytics/AdherenceCard.jsx";
import RefillHistory from "../components/analytics/RefillHistory.jsx";

import useSimulatedLoad from "../hooks/useSimulatedLoad.js";
import { getAnalyticsData } from "../utils/analyticsutils.js";

const margin = {
  top: 4,
  right: 4,
  left: -16,
  bottom: 0,
};

const axis = {
  tickLine: false,
  axisLine: false,
};

const legend = {
  iconType: "circle",
  iconSize: 8,
  verticalAlign: "top",
  align: "right",
  height: 28,
};

const cursor = {
  fill: "rgb(161 161 170 / 0.12)",
};

const exportCSV = (data) => {
  const sections = [
    {
      name: "Consumption",
      rows: data.consumptionTrend,
    },
    {
      name: "Inventory",
      rows: data.inventoryHistory,
    },
    {
      name: "Weekly Completion",
      rows: data.weeklyCompletion,
    },
    {
      name: "Monthly Overview",
      rows: data.monthlyOverview,
    },
    {
      name: "Refill History",
      rows: data.refillHistory,
    },
  ];

  const csv = sections
    .map(({ name, rows }) => {
      if (!rows.length) {
        return `${name}\nNo data`;
      }

      const headers = Object.keys(rows[0]);

      const escape = (value) => {
        const text = String(value ?? "");
        return `"${text.replace(/"/g, '""')}"`;
      };

      return [
        name,
        headers.map(escape).join(","),
        ...rows.map((row) =>
          headers.map((key) => escape(row[key])).join(",")
        ),
      ].join("\n");
    })
    .join("\n\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `doselyt-analytics-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

export default function Analytics() {
  const loading = useSimulatedLoad();

  const [range, setRange] = useState("30d");

  const [analytics, setAnalytics] = useState(() =>
    getAnalyticsData("30d")
  );

  // Refresh analytics whenever the selected range changes
  // or localStorage is updated.
  useEffect(() => {
    const refreshAnalytics = () => {
      setAnalytics(getAnalyticsData(range));
    };

    refreshAnalytics();

    window.addEventListener("storage", refreshAnalytics);
    window.addEventListener("doselyt:storage", refreshAnalytics);

    return () => {
      window.removeEventListener("storage", refreshAnalytics);
      window.removeEventListener("doselyt:storage", refreshAnalytics);
    };
  }, [range]);

  const handleExport = () => {
    exportCSV(analytics);
  };

  return (
    <>
      <PageHeading
        title="Analytics"
        description="Consumption, stock and adherence over time."
        actions={
          <>
            <FilterTabs
              value={range}
              onChange={setRange}
              options={[
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
                { value: "90d", label: "90 days" },
              ]}
            />

            <Button
              icon={Download}
              className="hidden sm:inline-flex"
              onClick={handleExport}
            >
              Export
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-lg lg:col-span-2" />
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg lg:col-span-2" />
        </div>
      ) : (
        <div className="space-y-5">

          {/* Consumption and Adherence */}
          <div className="grid gap-5 lg:grid-cols-3">
            <ChartCard
              className="lg:col-span-2"
              title="Medicine consumption"
              description="Units consumed per week"
              height={260}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analytics.consumptionTrend}
                  margin={margin}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="week" {...axis} />
                  <YAxis {...axis} />

                  <Tooltip content={<ChartTooltip />} />
                  <Legend {...legend} />

                  <Line
                    type="monotone"
                    dataKey="inograf"
                    name="Inograf"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="moflat"
                    name="Mofetyl / Moflat"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="other"
                    name="Others"
                    stroke="#a1a1aa"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <AdherenceCard data={analytics.adherence} />
          </div>

          {/* Inventory and Weekly Completion */}
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard
              title="Inventory history"
              description="Estimated total units on hand"
              height={240}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.inventoryHistory}
                  margin={margin}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="month" {...axis} />
                  <YAxis {...axis} />

                  <Tooltip
                    content={<ChartTooltip unit=" units" />}
                  />

                  <Area
                    type="monotone"
                    dataKey="stock"
                    name="On hand"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    fill="#14b8a6"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Completed vs pending"
              description="Estimated administrations this week"
              height={240}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.weeklyCompletion}
                  margin={margin}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="day" {...axis} />
                  <YAxis {...axis} />

                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={cursor}
                  />

                  <Legend {...legend} />

                  <Bar
                    dataKey="completed"
                    name="Logged"
                    stackId="a"
                    fill="#14b8a6"
                    barSize={18}
                  />

                  <Bar
                    dataKey="pending"
                    name="Not logged"
                    stackId="a"
                    fill="#a1a1aa"
                    fillOpacity={0.5}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Monthly Overview and Refill History */}
          <div className="">
            <ChartCard
              className="lg:col-span-2"
              title="Monthly overview"
              description="Logged and estimated missed administrations"
              height={240}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.monthlyOverview}
                  margin={margin}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="month" {...axis} />
                  <YAxis {...axis} />

                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={cursor}
                  />

                  <Legend {...legend} />

                  <Bar
                    dataKey="taken"
                    name="Logged"
                    fill="#14b8a6"
                    radius={[3, 3, 0, 0]}
                  />

                  <Bar
                    dataKey="missed"
                    name="Estimated not logged"
                    fill="#f59e0b"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

          </div>
        </div>
      )}
    </>
  );
}
