import { type FC, useState, useCallback } from 'react';
import { FileDown, FileText, Table, Code, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Checkbox,
} from '@/components/ui';
import type { ReportFormat, ReportType } from '@/store/api/reportsApi';
import { cn } from '@/utils/cn';

export interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: ReportType;
  onExport: (format: ReportFormat, options: ExportOptions) => Promise<void>;
  isExporting?: boolean;
}

export interface ExportOptions {
  includeCharts: boolean;
  includeDetails: boolean;
}

interface FormatOption {
  format: ReportFormat;
  label: string;
  description: string;
  icon: typeof FileText;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    format: 'pdf',
    label: 'PDF',
    description: 'Portable document with charts and formatting',
    icon: FileText,
  },
  {
    format: 'xlsx',
    label: 'Excel',
    description: 'Spreadsheet with multiple sheets and data',
    icon: Table,
  },
  {
    format: 'csv',
    label: 'CSV',
    description: 'Comma-separated values for data import',
    icon: Table,
  },
  {
    format: 'html',
    label: 'HTML',
    description: 'Web page format for browser viewing',
    icon: Code,
  },
];

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  summary: 'Summary Report',
  coverage: 'Coverage Report',
  defects: 'Defects Report',
  activity: 'Activity Report',
};

/**
 * Dialog for selecting export format and options for reports.
 */
export const ExportDialog: FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  reportType,
  onExport,
  isExporting,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('pdf');
  const [options, setOptions] = useState<ExportOptions>({
    includeCharts: true,
    includeDetails: true,
  });

  const handleExport = useCallback(async () => {
    await onExport(selectedFormat, options);
  }, [selectedFormat, options, onExport]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Export {REPORT_TYPE_LABELS[reportType]} to your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Select Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FORMAT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedFormat === option.format;

                return (
                  <button
                    key={option.format}
                    type="button"
                    onClick={() => setSelectedFormat(option.format)}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <span
                        className={cn(
                          'font-medium',
                          isSelected ? 'text-primary' : 'text-foreground'
                        )}
                      >
                        {option.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={options.includeCharts}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({
                      ...prev,
                      includeCharts: checked === true,
                    }))
                  }
                  disabled={selectedFormat === 'csv'}
                />
                <span className="text-sm text-foreground">Include charts</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={options.includeDetails}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({
                      ...prev,
                      includeDetails: checked === true,
                    }))
                  }
                />
                <span className="text-sm text-foreground">
                  Include detailed breakdown
                </span>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
