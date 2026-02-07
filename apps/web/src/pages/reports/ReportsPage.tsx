import { type FC, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  PieChart,
  Bug,
  Activity,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  Input,
} from '@/components/ui';
import type { ReportType } from '@/store/api/reportsApi';
import { cn } from '@/utils/cn';

interface ReportTypeCard {
  type: ReportType;
  title: string;
  description: string;
  icon: typeof BarChart3;
  color: string;
}

const REPORT_TYPES: ReportTypeCard[] = [
  {
    type: 'summary',
    title: 'Summary Report',
    description: 'Overall testing metrics, pass rate, and status distribution',
    icon: BarChart3,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    type: 'coverage',
    title: 'Coverage Report',
    description: 'Requirement and test suite coverage analysis',
    icon: PieChart,
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    type: 'defects',
    title: 'Defects Report',
    description: 'Defect metrics, severity breakdown, and trends',
    icon: Bug,
    color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
  {
    type: 'activity',
    title: 'Activity Report',
    description: 'Team activity timeline and user contributions',
    icon: Activity,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
];

/**
 * Reports page displaying available report types with date picker.
 * Allows users to select a report type to view detailed report.
 */
export const ReportsPage: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleReportSelect = useCallback(
    (type: ReportType) => {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const queryString = params.toString();
      navigate(`/projects/${projectId}/reports/${type}${queryString ? `?${queryString}` : ''}`);
    },
    [projectId, navigate, startDate, endDate]
  );

  if (!projectId) {
    return (
      <Alert variant="error">
        <AlertDescription>Project ID is required</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Reports
          </h1>
          <p className="mt-1 text-muted-foreground">
            Generate and view testing reports for this project
          </p>
        </div>
      </div>

      {/* Date Range Picker */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Date Range</CardTitle>
          </div>
          <CardDescription>
            Filter report data by date range (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">From:</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">To:</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Type Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;

          return (
            <Card
              key={report.type}
              className="cursor-pointer transition-colors hover:border-primary/50"
              onClick={() => handleReportSelect(report.type)}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
                      report.color
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Report
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
