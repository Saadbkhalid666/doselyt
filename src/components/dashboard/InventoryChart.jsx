import { ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ChartCard, { ChartTooltip } from '../shared/ChartCard.jsx';

export default function InventoryChart({ data }) {
  return (
    <ChartCard title="Inventory trend" description="Units on hand against daily consumption, last 14 days" height={280}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
          <YAxis yAxisId="l" tickLine={false} axisLine={false} />
          <YAxis yAxisId="r" orientation="right" hide domain={[0, 60]} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgb(161 161 170 / 0.4)' }} />
          <Legend iconType="circle" iconSize={8} verticalAlign="top" align="right" height={28} />
          <Area yAxisId="l" type="monotone" dataKey="stock" name="On hand" stroke="#14b8a6" strokeWidth={2} fill="#14b8a6" fillOpacity={0.1} />
          <Bar yAxisId="r" dataKey="consumed" name="Consumed" fill="#a1a1aa" fillOpacity={0.5} radius={[3, 3, 0, 0]} barSize={10} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
