import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import {
  ProjectSummaryDto,
  CoverageReportDto,
  DefectsReportDto,
  ActivityReportDto,
  TrendsReportDto,
} from './dto';

interface PdfGenerationResult {
  stream: PassThrough;
  filename: string;
}

@Injectable()
export class PdfGeneratorService {
  private readonly colors = {
    primary: '#1e40af',
    secondary: '#6b7280',
    success: '#059669',
    danger: '#dc2626',
    warning: '#d97706',
    background: '#f3f4f6',
    border: '#e5e7eb',
  };

  private readonly fonts = {
    title: 24,
    heading: 16,
    subheading: 14,
    body: 11,
    small: 9,
  };

  generateSummaryPdf(data: ProjectSummaryDto): PdfGenerationResult {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    const stream = new PassThrough();
    doc.pipe(stream);

    this.addHeader(doc, 'Project Summary Report');
    this.addGeneratedAt(doc, data.generatedAt);

    // Test Execution Summary
    this.addSectionTitle(doc, 'Test Execution Summary');
    const executionData = [
      ['Total Test Cases', data.testExecution.totalTestCases.toString()],
      ['Total Test Results', data.testExecution.totalTestResults.toString()],
      ['Passed', data.testExecution.passed.toString()],
      ['Failed', data.testExecution.failed.toString()],
      ['Blocked', data.testExecution.blocked.toString()],
      ['Skipped', data.testExecution.skipped.toString()],
      ['Retest', data.testExecution.retest.toString()],
      ['Untested', data.testExecution.untested.toString()],
      ['Pass Rate', `${data.testExecution.passRate}%`],
      ['Execution Progress', `${data.testExecution.executionProgress}%`],
    ];
    this.addTable(doc, executionData);

    doc.moveDown(1.5);

    // Test Run Summary
    this.addSectionTitle(doc, 'Test Run Summary');
    const runData = [
      ['Total Test Runs', data.testRuns.total.toString()],
      ['Not Started', data.testRuns.notStarted.toString()],
      ['In Progress', data.testRuns.inProgress.toString()],
      ['Completed', data.testRuns.completed.toString()],
      ['Aborted', data.testRuns.aborted.toString()],
    ];
    this.addTable(doc, runData);

    doc.moveDown(1.5);

    // Requirement Coverage Summary
    this.addSectionTitle(doc, 'Requirement Coverage Summary');
    const coverageData = [
      ['Total Requirements', data.requirementCoverage.totalRequirements.toString()],
      ['Covered Requirements', data.requirementCoverage.coveredRequirements.toString()],
      ['Uncovered Requirements', data.requirementCoverage.uncoveredRequirements.toString()],
      ['Coverage Percentage', `${data.requirementCoverage.coveragePercentage}%`],
    ];
    this.addTable(doc, coverageData);

    this.addFooter(doc);
    doc.end();

    return {
      stream,
      filename: `project-summary-${this.formatDateForFilename(data.generatedAt)}.pdf`,
    };
  }

  generateCoveragePdf(data: CoverageReportDto): PdfGenerationResult {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    const stream = new PassThrough();
    doc.pipe(stream);

    this.addHeader(doc, 'Requirement Coverage Report');
    this.addGeneratedAt(doc, data.generatedAt);

    // Coverage Summary
    this.addSectionTitle(doc, 'Coverage Summary');
    const summaryData = [
      ['Total Requirements', data.totalRequirements.toString()],
      ['Covered Requirements', data.coveredRequirements.toString()],
      ['Uncovered Requirements', data.uncoveredRequirements.toString()],
      ['Coverage Percentage', `${data.coveragePercentage}%`],
    ];
    this.addTable(doc, summaryData);

    doc.moveDown(1.5);

    // Requirements Detail
    if (data.requirements.length > 0) {
      this.addSectionTitle(doc, 'Requirements Detail');

      const tableHeaders = ['External ID', 'Title', 'Status', 'Test Cases', 'Covered'];
      const tableData = data.requirements.map((req) => [
        req.externalId || '-',
        this.truncateText(req.title, 30),
        req.status,
        req.linkedTestCases.toString(),
        req.isCovered ? 'Yes' : 'No',
      ]);

      this.addDataTable(doc, tableHeaders, tableData);
    }

    this.addFooter(doc);
    doc.end();

    return {
      stream,
      filename: `coverage-report-${this.formatDateForFilename(data.generatedAt)}.pdf`,
    };
  }

  generateDefectsPdf(data: DefectsReportDto): PdfGenerationResult {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    const stream = new PassThrough();
    doc.pipe(stream);

    this.addHeader(doc, 'Defects Report');
    this.addGeneratedAt(doc, data.generatedAt);

    // Defects Summary
    this.addSectionTitle(doc, 'Defects Summary');
    const summaryData = [
      ['Total Unique Defects', data.totalDefects.toString()],
      ['Total Failed Tests', data.totalFailedTests.toString()],
      ['Failed Tests with Defects', data.failedTestsWithDefects.toString()],
      ['Failed Tests without Defects', data.failedTestsWithoutDefects.toString()],
    ];
    this.addTable(doc, summaryData);

    doc.moveDown(1.5);

    // Defects Detail
    if (data.defects.length > 0) {
      this.addSectionTitle(doc, 'Defects Detail');

      const tableHeaders = ['Defect ID', 'Linked Test Results', 'Affected Test Cases'];
      const tableData = data.defects.map((defect) => [
        defect.defectId,
        defect.linkedTestResults.toString(),
        defect.affectedTestCases.toString(),
      ]);

      this.addDataTable(doc, tableHeaders, tableData);
    }

    this.addFooter(doc);
    doc.end();

    return {
      stream,
      filename: `defects-report-${this.formatDateForFilename(data.generatedAt)}.pdf`,
    };
  }

  generateActivityPdf(data: ActivityReportDto): PdfGenerationResult {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    const stream = new PassThrough();
    doc.pipe(stream);

    this.addHeader(doc, 'Activity Report');
    this.addGeneratedAt(doc, data.generatedAt);

    // Period and Summary
    this.addSectionTitle(doc, 'Report Period');
    const periodData = [
      ['Period Start', data.periodStart],
      ['Period End', data.periodEnd],
      ['Total Tests Executed', data.totalTestsExecuted.toString()],
    ];
    this.addTable(doc, periodData);

    doc.moveDown(1.5);

    // Daily Activity
    if (data.dailyActivity.length > 0) {
      this.addSectionTitle(doc, 'Daily Activity');

      const dailyHeaders = ['Date', 'Tests Executed', 'Passed', 'Failed'];
      const dailyData = data.dailyActivity.map((day) => [
        day.date,
        day.testsExecuted.toString(),
        day.passed.toString(),
        day.failed.toString(),
      ]);

      this.addDataTable(doc, dailyHeaders, dailyData);
      doc.moveDown(1.5);
    }

    // Tester Activity
    if (data.testerActivity.length > 0) {
      this.addSectionTitle(doc, 'Tester Activity');

      const testerHeaders = ['User ID', 'Tests Executed', 'Passed', 'Failed', 'Pass Rate'];
      const testerData = data.testerActivity.map((tester) => [
        tester.userId || 'Unknown',
        tester.testsExecuted.toString(),
        tester.passed.toString(),
        tester.failed.toString(),
        `${tester.passRate}%`,
      ]);

      this.addDataTable(doc, testerHeaders, testerData);
    }

    this.addFooter(doc);
    doc.end();

    return {
      stream,
      filename: `activity-report-${this.formatDateForFilename(data.generatedAt)}.pdf`,
    };
  }

  generateTrendsPdf(data: TrendsReportDto): PdfGenerationResult {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    const stream = new PassThrough();
    doc.pipe(stream);

    this.addHeader(doc, 'Trends Report');
    this.addGeneratedAt(doc, data.generatedAt);

    // Period and Summary
    this.addSectionTitle(doc, 'Report Summary');
    const summaryData = [
      ['Period Start', data.periodStart],
      ['Period End', data.periodEnd],
      ['Average Pass Rate', `${data.averagePassRate}%`],
      ['Pass Rate Trend', this.formatTrend(data.passRateTrend)],
    ];
    this.addTable(doc, summaryData);

    doc.moveDown(1.5);

    // Execution Trends
    if (data.executionTrends.length > 0) {
      this.addSectionTitle(doc, 'Execution Trends');

      const execHeaders = ['Date', 'Tests Executed', 'Passed', 'Failed', 'Pass Rate'];
      const execData = data.executionTrends.map((trend) => [
        trend.date,
        trend.testsExecuted.toString(),
        trend.passed.toString(),
        trend.failed.toString(),
        `${trend.passRate}%`,
      ]);

      this.addDataTable(doc, execHeaders, execData);
      doc.moveDown(1.5);
    }

    // Defect Trends
    if (data.defectTrends.length > 0) {
      this.addSectionTitle(doc, 'Defect Trends');

      const defectHeaders = ['Date', 'New Defects', 'Cumulative Defects'];
      const defectData = data.defectTrends.map((trend) => [
        trend.date,
        trend.newDefects.toString(),
        trend.cumulativeDefects.toString(),
      ]);

      this.addDataTable(doc, defectHeaders, defectData);
    }

    this.addFooter(doc);
    doc.end();

    return {
      stream,
      filename: `trends-report-${this.formatDateForFilename(data.generatedAt)}.pdf`,
    };
  }

  // ============ Helper Methods ============

  private addHeader(doc: InstanceType<typeof PDFDocument>, title: string): void {
    doc
      .fillColor(this.colors.primary)
      .fontSize(this.fonts.title)
      .text(title, { align: 'center' });

    doc.moveDown(0.5);

    // Add a horizontal line
    const lineY = doc.y;
    doc
      .strokeColor(this.colors.border)
      .lineWidth(1)
      .moveTo(50, lineY)
      .lineTo(doc.page.width - 50, lineY)
      .stroke();

    doc.moveDown(1);
  }

  private addGeneratedAt(doc: InstanceType<typeof PDFDocument>, date: Date): void {
    doc
      .fillColor(this.colors.secondary)
      .fontSize(this.fonts.small)
      .text(`Generated: ${this.formatDate(date)}`, { align: 'right' });

    doc.moveDown(1);
  }

  private addSectionTitle(doc: InstanceType<typeof PDFDocument>, title: string): void {
    doc
      .fillColor(this.colors.primary)
      .fontSize(this.fonts.heading)
      .text(title);

    doc.moveDown(0.5);
  }

  private addTable(doc: InstanceType<typeof PDFDocument>, rows: string[][]): void {
    const startX = 50;
    const colWidth = 200;
    const rowHeight = 22;
    const padding = 8;

    doc.fontSize(this.fonts.body);

    for (const row of rows) {
      const label = row[0] ?? '';
      const value = row[1] ?? '';
      const rowY = doc.y;

      // Label
      doc.fillColor(this.colors.secondary).text(label, startX + padding, rowY + 5, {
        width: colWidth - padding * 2,
      });

      // Value
      doc.fillColor('#000000').text(value, startX + colWidth + padding, rowY + 5, {
        width: colWidth - padding * 2,
      });

      doc.y = rowY + rowHeight;
    }
  }

  private addDataTable(doc: InstanceType<typeof PDFDocument>, headers: string[], rows: string[][]): void {
    const startX = 50;
    const pageWidth = doc.page.width - 100;
    const colWidth = pageWidth / headers.length;
    const rowHeight = 20;
    const headerHeight = 25;
    const padding = 5;

    // Check if we need a new page
    if (doc.y + headerHeight + rowHeight * Math.min(rows.length, 5) > doc.page.height - 80) {
      doc.addPage();
    }

    // Header row
    const headerY = doc.y;
    doc.fillColor(this.colors.background);
    doc.rect(startX, headerY, pageWidth, headerHeight).fill();

    doc.fillColor(this.colors.primary).fontSize(this.fonts.small);
    headers.forEach((header, i) => {
      doc.text(header, startX + i * colWidth + padding, headerY + 7, {
        width: colWidth - padding * 2,
        align: 'left',
      });
    });

    doc.y = headerY + headerHeight;

    // Data rows
    doc.fillColor('#000000').fontSize(this.fonts.small);
    for (const row of rows) {
      // Check if we need a new page
      if (doc.y + rowHeight > doc.page.height - 80) {
        doc.addPage();
        // Re-add headers on new page
        const newHeaderY = doc.y;
        doc.fillColor(this.colors.background);
        doc.rect(startX, newHeaderY, pageWidth, headerHeight).fill();

        doc.fillColor(this.colors.primary).fontSize(this.fonts.small);
        headers.forEach((header, i) => {
          doc.text(header, startX + i * colWidth + padding, newHeaderY + 7, {
            width: colWidth - padding * 2,
            align: 'left',
          });
        });
        doc.y = newHeaderY + headerHeight;
        doc.fillColor('#000000');
      }

      const rowY = doc.y;

      // Draw row border
      doc.strokeColor(this.colors.border).lineWidth(0.5);
      doc
        .moveTo(startX, rowY + rowHeight)
        .lineTo(startX + pageWidth, rowY + rowHeight)
        .stroke();

      row.forEach((cell, i) => {
        doc.text(cell, startX + i * colWidth + padding, rowY + 5, {
          width: colWidth - padding * 2,
          align: 'left',
        });
      });

      doc.y = rowY + rowHeight;
    }
  }

  private addFooter(doc: InstanceType<typeof PDFDocument>): void {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      // Add page number
      doc
        .fillColor(this.colors.secondary)
        .fontSize(this.fonts.small)
        .text(`Page ${i + 1} of ${pages.count}`, 50, doc.page.height - 50, {
          align: 'center',
          width: doc.page.width - 100,
        });

      // Add QualityHub branding
      doc
        .fillColor(this.colors.secondary)
        .fontSize(this.fonts.small)
        .text('Generated by QualityHub', 50, doc.page.height - 35, {
          align: 'center',
          width: doc.page.width - 100,
        });
    }
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

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}
