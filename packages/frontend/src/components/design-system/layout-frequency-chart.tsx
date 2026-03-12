'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LayoutFrequencyChartProps {
  layouts: Array<{ type: string; frequency?: number }>;
}

export function LayoutFrequencyChart({ layouts }: LayoutFrequencyChartProps) {
  const data = layouts
    .filter((l) => l.frequency != null)
    .map((l) => ({ name: l.type, frequency: l.frequency }));

  if (data.length === 0) return null;

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            unit="%"
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Frequency']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--background))',
            }}
          />
          <Bar
            dataKey="frequency"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
