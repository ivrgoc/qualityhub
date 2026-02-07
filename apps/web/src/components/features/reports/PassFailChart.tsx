import { type FC, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { StatusDistribution } from '@/store/api/reportsApi';

export interface PassFailChartProps {
  data: StatusDistribution;
  className?: string;
}

const STATUS_COLORS: Record<keyof StatusDistribution, string> = {
  passed: '#22c55e',
  failed: '#ef4444',
  blocked: '#f59e0b',
  retest: '#8b5cf6',
  skipped: '#6b7280',
  untested: '#e5e7eb',
};

const STATUS_LABELS: Record<keyof StatusDistribution, string> = {
  passed: 'Passed',
  failed: 'Failed',
  blocked: 'Blocked',
  retest: 'Retest',
  skipped: 'Skipped',
  untested: 'Untested',
};

/**
 * Pie chart component displaying test status distribution.
 * Shows passed, failed, blocked, retest, skipped, and untested counts.
 */
export const PassFailChart: FC<PassFailChartProps> = ({ data, className }) => {
  const chartData = useMemo(() => {
    return (Object.keys(data) as Array<keyof StatusDistribution>)
      .map((key) => ({
        name: STATUS_LABELS[key],
        value: data[key],
        color: STATUS_COLORS[key],
      }))
      .filter((item) => item.value > 0);
  }, [data]);

  const total = useMemo(() => {
    return Object.values(data).reduce((sum, val) => sum + val, 0);
  }, [data]);

  if (total === 0) {
    return (
      <div className={className}>
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          No test data available
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [value, 'Tests']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
