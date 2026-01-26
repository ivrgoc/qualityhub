import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimpleBarChart, type ChartDataPoint } from './SimpleBarChart';

// Mock ResizeObserver for recharts ResponsiveContainer
beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

describe('SimpleBarChart', () => {
  const sampleData: ChartDataPoint[] = [
    { name: 'Jan', value: 100 },
    { name: 'Feb', value: 200 },
    { name: 'Mar', value: 150 },
  ];

  it('should render the chart container with data', () => {
    render(<SimpleBarChart data={sampleData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should show empty state when data is empty', () => {
    render(<SimpleBarChart data={[]} />);
    expect(screen.getByTestId('empty-chart')).toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<SimpleBarChart data={sampleData} className="custom-chart" />);
    expect(screen.getByTestId('bar-chart')).toHaveClass('custom-chart');
  });

  it('should render with different bar colors', () => {
    const { container } = render(<SimpleBarChart data={sampleData} barColor="#ff0000" />);
    expect(container.querySelector('[data-testid="bar-chart"]')).toBeInTheDocument();
  });
});
