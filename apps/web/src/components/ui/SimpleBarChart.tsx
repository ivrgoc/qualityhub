import { type FC } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface ChartDataPoint {
  name: string;
  value: number;
}

interface SimpleBarChartProps {
  data: ChartDataPoint[];
  barColor?: string;
  height?: number;
  className?: string;
}

export const SimpleBarChart: FC<SimpleBarChartProps> = ({
  data,
  barColor = '#3b82f6',
  height = 300,
  className,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={className} data-testid="empty-chart">
        No data available
      </div>
    );
  }

  return (
    <div className={className} data-testid="bar-chart">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill={barColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
