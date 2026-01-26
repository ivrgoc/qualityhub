import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PassThrough } from 'stream';
import {
  ProjectSummaryDto,
  CoverageReportDto,
  DefectsReportDto,
  ActivityReportDto,
  TrendsReportDto,
} from './dto';

export interface ExcelGenerationResult {
  stream: PassThrough;
  filename: string;
}

@Injectable()
export class ExcelGeneratorService {
  private readonly colors = {
    primary: '1E40AF',
    secondary: '6B7280',
    success: '059669',
    danger: 'DC2626',
    warning: 'D97706',
    background: 'F3F4F6',
    border: 'E5E7EB',
    headerBg: '1E40AF',
    headerText: 'FFFFFF',
  };

  async generateSummaryExcel(data: ProjectSummaryDto): Promise<ExcelGenerationResult> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QualityHub';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    this.setupWorksheet(summarySheet);

    this.addTitle(summarySheet, 'Project Summary Report');
    this.addGeneratedAt(summarySheet, data.generatedAt);

    // Test Execution Summary
    summarySheet.addRow([]);
    this.addSectionHeader(summarySheet, 'Test Execution Summary');
    const executionData = [
      ['Total Test Cases', data.testExecution.totalTestCases],
      ['Total Test Results', data.testExecution.totalTestResults],
      ['Passed', data.testExecution.passed],
      ['Failed', data.testExecution.failed],
      ['Blocked', data.testExecution.blocked],
      ['Skipped', data.testExecution.skipped],
      ['Retest', data.testExecution.retest],
      ['Untested', data.testExecution.untested],
      ['Pass Rate', `${data.testExecution.passRate}%`],
      ['Execution Progress', `${data.testExecution.executionProgress}%`],
    ];
    this.addKeyValueTable(summarySheet, executionData);

    // Test Run Summary
    summarySheet.addRow([]);
    this.addSectionHeader(summarySheet, 'Test Run Summary');
    const runData = [
      ['Total Test Runs', data.testRuns.total],
      ['Not Started', data.testRuns.notStarted],
      ['In Progress', data.testRuns.inProgress],
      ['Completed', data.testRuns.completed],
      ['Aborted', data.testRuns.aborted],
    ];
    this.addKeyValueTable(summarySheet, runData);

    // Requirement Coverage Summary
    summarySheet.addRow([]);
    this.addSectionHeader(summarySheet, 'Requirement Coverage Summary');
    const coverageData = [
      ['Total Requirements', data.requirementCoverage.totalRequirements],
      ['Covered Requirements', data.requirementCoverage.coveredRequirements],
      ['Uncovered Requirements', data.requirementCoverage.uncoveredRequirements],
      ['Coverage Percentage', `${data.requirementCoverage.coveragePercentage}%`],
    ];
    this.addKeyValueTable(summarySheet, coverageData);

    this.addFooter(summarySheet);

    const stream = new PassThrough();
    await workbook.xlsx.write(stream);
    stream.end();

    return {
      stream,
      filename: `project-summary-${this.formatDateForFilename(data.generatedAt)}.xlsx`,
    };
  }

  async generateCoverageExcel(data: CoverageReportDto): Promise<ExcelGenerationResult> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QualityHub';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Coverage Summary');
    this.setupWorksheet(summarySheet);

    this.addTitle(summarySheet, 'Requirement Coverage Report');
    this.addGeneratedAt(summarySheet, data.generatedAt);

    summarySheet.addRow([]);
    this.addSectionHeader(summarySheet, 'Coverage Summary');
    const summaryData = [
      ['Total Requirements', data.totalRequirements],
      ['Covered Requirements', data.coveredRequirements],
      ['Uncovered Requirements', data.uncoveredRequirements],
      ['Coverage Percentage', `${data.coveragePercentage}%`],
    ];
    this.addKeyValueTable(summarySheet, summaryData);

    // Requirements Detail Sheet
    if (data.requirements.length > 0) {
      const detailSheet = workbook.addWorksheet('Requirements Detail');
      this.setupWorksheet(detailSheet);

      this.addTitle(detailSheet, 'Requirements Detail');

      const headers = ['External ID', 'Title', 'Status', 'Linked Test Cases', 'Covered'];
      this.addDataTableHeader(detailSheet, headers);

      data.requirements.forEach((req) => {
        const row = detailSheet.addRow([
          req.externalId || '-',
          req.title,
          req.status,
          req.linkedTestCases,
          req.isCovered ? 'Yes' : 'No',
        ]);
        this.styleDataRow(row, req.isCovered);
      });

      this.autoFitColumns(detailSheet);
    }

    this.addFooter(summarySheet);

    const stream = new PassThrough();
    await workbook.xlsx.write(stream);
    stream.end();

    return {
      stream,
      filename: `coverage-report-${this.formatDateForFilename(data.generatedAt)}.xlsx`,
    };
  }

  async generateDefectsExcel(data: DefectsReportDto): Promise<ExcelGenerationResult> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QualityHub';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Defects Summary');
    this.setupWorksheet(summarySheet);

    this.addTitle(summarySheet, 'Defects Report');
    this.addGeneratedAt(summarySheet, data.generatedAt);

    summarySheet.addRow([]);
    this.addSectionHeader(summarySheet, 'Defects Summary');
    const summaryData = [
      ['Total Unique Defects', data.totalDefects],
      ['Total Failed Tests', data.totalFailedTests],
      ['Failed Tests with Defects', data.failedTestsWithDefects],
      ['Failed Tests without Defects', data.failedTestsWithoutDefects],
    ];
    this.addKeyValueTable(summarySheet, summaryData);

    // Defects Detail Sheet
    if (data.defects.length > 0) {
      const detailSheet = workbook.addWorksheet('Defects Detail');
      this.setupWorksheet(detailSheet);

      this.addTitle(detailSheet, 'Defects Detail');

      const headers = ['Defect ID', 'Linked Test Results', 'Affected Test Cases'];
      this.addDataTableHeader(detailSheet, headers);

      data.defects.forEach((defect) => {
        const row = detailSheet.addRow([
          defect.defectId,
          defect.linkedTestResults,
          defect.affectedTestCases,
        ]);
        this.styleDataRow(row);
      });

      this.autoFitColumns(detailSheet);
    }

    this.addFooter(summarySheet);

    const stream = new PassThrough();
    await workbook.xlsx.write(stream);
    stream.end();

    return {
      stream,
      filename: `defects-report-${this.formatDateForFilename(data.generatedAt)}.xlsx`,
    };
  }

  async generateActivityExcel(data: ActivityReportDto): Promise<ExcelGenerationResult> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QualityHub';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Activity Summary');
    this.setupWorksheet(summarySheet);

    this.addTitle(summarySheet, 'Activity Report');
    this.addGeneratedAt(summarySheet, data.generatedAt);

    summarySheet.addRow([]);
    this.addSectionHeader(summarySheet, 'Report Period');
    const periodData = [
      ['Period Start', data.periodStart],
      ['Period End', data.periodEnd],
      ['Total Tests Executed', data.totalTestsExecuted],
    ];
    this.addKeyValueTable(summarySheet, periodData);

    // Daily Activity Sheet
    if (data.dailyActivity.length > 0) {
      const dailySheet = workbook.addWorksheet('Daily Activity');
      this.setupWorksheet(dailySheet);

      this.addTitle(dailySheet, 'Daily Activity');

      const dailyHeaders = ['Date', 'Tests Executed', 'Passed', 'Failed'];
      this.addDataTableHeader(dailySheet, dailyHeaders);

      data.dailyActivity.forEach((day) => {
        const row = dailySheet.addRow([
          day.date,
          day.testsExecuted,
          day.passed,
          day.failed,
        ]);
        this.styleDataRow(row);
      });

      this.autoFitColumns(dailySheet);
    }

    // Tester Activity Sheet
    if (data.testerActivity.length > 0) {
      const testerSheet = workbook.addWorksheet('Tester Activity');
      this.setupWorksheet(testerSheet);

      this.addTitle(testerSheet, 'Tester Activity');

      const testerHeaders = ['User ID', 'Tests Executed', 'Passed', 'Failed', 'Pass Rate'];
      this.addDataTableHeader(testerSheet, testerHeaders);

      data.testerActivity.forEach((tester) => {
        const row = testerSheet.addRow([
          tester.userId || 'Unknown',
          tester.testsExecuted,
          tester.passed,
          tester.failed,
          `${tester.passRate}%`,
        ]);
        this.styleDataRow(row);
      });

      this.autoFitColumns(testerSheet);
    }

    this.addFooter(summarySheet);

    const stream = new PassThrough();
    await workbook.xlsx.write(stream);
    stream.end();

    return {
      stream,
      filename: `activity-report-${this.formatDateForFilename(data.generatedAt)}.xlsx`,
    };
  }

  async generateTrendsExcel(data: TrendsReportDto): Promise<ExcelGenerationResult> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QualityHub';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Trends Summary');
    this.setupWorksheet(summarySheet);

    this.addTitle(summarySheet, 'Trends Report');
    this.addGeneratedAt(summarySheet, data.generatedAt);

    summarySheet.addRow([]);
    this.addSectionHeader(summarySheet, 'Report Summary');
    const summaryData = [
      ['Period Start', data.periodStart],
      ['Period End', data.periodEnd],
      ['Average Pass Rate', `${data.averagePassRate}%`],
      ['Pass Rate Trend', this.formatTrend(data.passRateTrend)],
    ];
    this.addKeyValueTable(summarySheet, summaryData);

    // Execution Trends Sheet
    if (data.executionTrends.length > 0) {
      const execSheet = workbook.addWorksheet('Execution Trends');
      this.setupWorksheet(execSheet);

      this.addTitle(execSheet, 'Execution Trends');

      const execHeaders = ['Date', 'Tests Executed', 'Passed', 'Failed', 'Pass Rate'];
      this.addDataTableHeader(execSheet, execHeaders);

      data.executionTrends.forEach((trend) => {
        const row = execSheet.addRow([
          trend.date,
          trend.testsExecuted,
          trend.passed,
          trend.failed,
          `${trend.passRate}%`,
        ]);
        this.styleDataRow(row);
      });

      this.autoFitColumns(execSheet);
    }

    // Defect Trends Sheet
    if (data.defectTrends.length > 0) {
      const defectSheet = workbook.addWorksheet('Defect Trends');
      this.setupWorksheet(defectSheet);

      this.addTitle(defectSheet, 'Defect Trends');

      const defectHeaders = ['Date', 'New Defects', 'Cumulative Defects'];
      this.addDataTableHeader(defectSheet, defectHeaders);

      data.defectTrends.forEach((trend) => {
        const row = defectSheet.addRow([
          trend.date,
          trend.newDefects,
          trend.cumulativeDefects,
        ]);
        this.styleDataRow(row);
      });

      this.autoFitColumns(defectSheet);
    }

    this.addFooter(summarySheet);

    const stream = new PassThrough();
    await workbook.xlsx.write(stream);
    stream.end();

    return {
      stream,
      filename: `trends-report-${this.formatDateForFilename(data.generatedAt)}.xlsx`,
    };
  }

  // ============ Helper Methods ============

  private setupWorksheet(sheet: ExcelJS.Worksheet): void {
    sheet.properties.defaultColWidth = 15;
    sheet.views = [{ showGridLines: false }];
  }

  private addTitle(sheet: ExcelJS.Worksheet, title: string): void {
    const row = sheet.addRow([title]);
    row.font = { bold: true, size: 18, color: { argb: this.colors.primary } };
    row.height = 30;
    sheet.mergeCells(row.number, 1, row.number, 5);
    row.alignment = { horizontal: 'center', vertical: 'middle' };

    // Add border below title
    const borderRow = sheet.addRow([]);
    borderRow.height = 5;
  }

  private addGeneratedAt(sheet: ExcelJS.Worksheet, date: Date): void {
    const row = sheet.addRow([`Generated: ${this.formatDate(date)}`]);
    row.font = { size: 10, color: { argb: this.colors.secondary } };
    row.alignment = { horizontal: 'right' };
    sheet.mergeCells(row.number, 1, row.number, 5);
  }

  private addSectionHeader(sheet: ExcelJS.Worksheet, title: string): void {
    const row = sheet.addRow([title]);
    row.font = { bold: true, size: 14, color: { argb: this.colors.primary } };
    row.height = 25;
    sheet.addRow([]);
  }

  private addKeyValueTable(
    sheet: ExcelJS.Worksheet,
    data: Array<(string | number)[]>,
  ): void {
    data.forEach(([label, value]) => {
      const row = sheet.addRow([label, value]);
      row.getCell(1).font = { color: { argb: this.colors.secondary } };
      row.getCell(2).font = { bold: true };
      row.getCell(1).alignment = { horizontal: 'left' };
      row.getCell(2).alignment = { horizontal: 'left' };
    });
  }

  private addDataTableHeader(sheet: ExcelJS.Worksheet, headers: string[]): void {
    const headerRow = sheet.addRow(headers);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: this.colors.headerBg },
      };
      cell.font = { bold: true, color: { argb: this.colors.headerText } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: this.colors.border } },
      };
    });
  }

  private styleDataRow(row: ExcelJS.Row, highlight?: boolean): void {
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: 'thin', color: { argb: this.colors.border } },
      };
      cell.alignment = { vertical: 'middle' };

      if (highlight === false) {
        cell.font = { color: { argb: this.colors.danger } };
      }
    });
  }

  private autoFitColumns(sheet: ExcelJS.Worksheet): void {
    sheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const cellValue = cell.value?.toString() || '';
        maxLength = Math.max(maxLength, Math.min(cellValue.length + 2, 50));
      });
      column.width = maxLength;
    });
  }

  private addFooter(sheet: ExcelJS.Worksheet): void {
    sheet.addRow([]);
    sheet.addRow([]);
    const footerRow = sheet.addRow(['Generated by QualityHub']);
    footerRow.font = { size: 9, color: { argb: this.colors.secondary }, italic: true };
    footerRow.alignment = { horizontal: 'center' };
    sheet.mergeCells(footerRow.number, 1, footerRow.number, 5);
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private formatDateForFilename(date: Date): string {
    const isoString = new Date(date).toISOString();
    return isoString.substring(0, isoString.indexOf('T'));
  }

  private formatTrend(value: number): string {
    if (value > 0) {
      return `+${value}% (improving)`;
    } else if (value < 0) {
      return `${value}% (declining)`;
    }
    return '0% (stable)';
  }
}
