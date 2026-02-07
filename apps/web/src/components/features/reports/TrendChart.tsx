import { type FC, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

export interface TrendDataPoint {
  date: string;
  passed?: number;
  failed?: number;
  total?: number;
  passRate?: number;
}

export interface TrendChartProps {
  data: TrendDataPoint[];
  lines?: Array<{
    dataKey: keyof Omit<TrendDataPoint, 'date'>;
    color: string;
    name: string;
  }>;
  showGrid?: boolean;
  className?: string;
}

const DEFAULT_LINES = [
  { dataKey: 'passed' as const, color: '#22c55e', name: 'Passed' },
  { dataKey: 'failed' as const, color: '#ef4444', name: 'Failed' },
];

/**
 * Line chart component displaying trends over time.
 * Can show passed/failed counts, pass rate, or custom metrics.
 */
export const TrendChart: FC<TrendChartProps> = ({
  data,
  lines = DEFAULT_LINES,
  showGrid = true,
  className,
}) => {
  const formattedData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedDate: format(parseISO(point.date), 'MMM d'),
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className={className}>
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          No trend data available
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.5}
            />
          )}
          <XAxis
            dataKey="formattedDate"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value: string) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              dot={{ fill: line.color, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name={line.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
