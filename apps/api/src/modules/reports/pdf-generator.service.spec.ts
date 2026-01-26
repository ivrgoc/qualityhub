import { Test, TestingModule } from '@nestjs/testing';
import { Buffer } from 'node:buffer';
import { PdfGeneratorService } from './pdf-generator.service';
import {
  ProjectSummaryDto,
  CoverageReportDto,
  DefectsReportDto,
  ActivityReportDto,
  TrendsReportDto,
} from './dto';

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfGeneratorService],
    }).compile();

    service = module.get<PdfGeneratorService>(PdfGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSummaryPdf', () => {
    const mockSummaryData: ProjectSummaryDto = {
      projectId: 'proj-123',
      testExecution: {
        totalTestCases: 100,
        totalTestResults: 80,
        passed: 60,
        failed: 10,
        blocked: 5,
        skipped: 3,
        retest: 2,
        untested: 0,
        passRate: 75,
        executionProgress: 80,
      },
      testRuns: {
        total: 10,
        notStarted: 2,
        inProgress: 3,
        completed: 4,
        aborted: 1,
      },
      requirementCoverage: {
        totalRequirements: 20,
        coveredRequirements: 15,
        uncoveredRequirements: 5,
        coveragePercentage: 75,
      },
      generatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    it('should return a stream and filename', () => {
      const result = service.generateSummaryPdf(mockSummaryData);

      expect(result).toHaveProperty('stream');
      expect(result).toHaveProperty('filename');
      expect(result.stream).toBeDefined();
      expect(result.filename).toMatch(/^project-summary-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should generate a valid PDF stream', (done) => {
      const result = service.generateSummaryPdf(mockSummaryData);
      const chunks: Buffer[] = [];

      result.stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      result.stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        // Check for PDF magic number (%PDF-)
        expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
        done();
      });

      result.stream.on('error', done);
    });
  });

  describe('generateCoveragePdf', () => {
    const mockCoverageData: CoverageReportDto = {
      projectId: 'proj-123',
      totalRequirements: 10,
      coveredRequirements: 8,
      uncoveredRequirements: 2,
      coveragePercentage: 80,
      requirements: [
        {
          requirementId: 'req-1',
          externalId: 'JIRA-123',
          title: 'User Authentication',
          status: 'approved',
          linkedTestCases: 5,
          isCovered: true,
        },
        {
          requirementId: 'req-2',
          externalId: null,
          title: 'Password Reset Functionality',
          status: 'draft',
          linkedTestCases: 0,
          isCovered: false,
        },
      ],
      generatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    it('should return a stream and filename', () => {
      const result = service.generateCoveragePdf(mockCoverageData);

      expect(result).toHaveProperty('stream');
      expect(result).toHaveProperty('filename');
      expect(result.filename).toMatch(/^coverage-report-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should generate a valid PDF stream', (done) => {
      const result = service.generateCoveragePdf(mockCoverageData);
      const chunks: Buffer[] = [];

      result.stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      result.stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
        done();
      });

      result.stream.on('error', done);
    });

    it('should handle empty requirements list', (done) => {
      const emptyData: CoverageReportDto = {
        ...mockCoverageData,
        requirements: [],
        totalRequirements: 0,
        coveredRequirements: 0,
        uncoveredRequirements: 0,
        coveragePercentage: 0,
      };

      const result = service.generateCoveragePdf(emptyData);
      const chunks: Buffer[] = [];

      result.stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      result.stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
        done();
      });

      result.stream.on('error', done);
    });
  });

  describe('generateDefectsPdf', () => {
    const mockDefectsData: DefectsReportDto = {
      projectId: 'proj-123',
      totalDefects: 5,
      totalFailedTests: 20,
      failedTestsWithDefects: 15,
      failedTestsWithoutDefects: 5,
      defects: [
        {
          defectId: 'DEF-001',
          linkedTestResults: 10,
          affectedTestCases: 3,
        },
        {
          defectId: 'DEF-002',
          linkedTestResults: 5,
          affectedTestCases: 2,
        },
      ],
      generatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    it('should return a stream and filename', () => {
      const result = service.generateDefectsPdf(mockDefectsData);

      expect(result).toHaveProperty('stream');
      expect(result).toHaveProperty('filename');
      expect(result.filename).toMatch(/^defects-report-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should generate a valid PDF stream', (done) => {
      const result = service.generateDefectsPdf(mockDefectsData);
      const chunks: Buffer[] = [];

      result.stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      result.stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
        done();
      });

      result.stream.on('error', done);
    });

    it('should handle empty defects list', (done) => {
      const emptyData: DefectsReportDto = {
        ...mockDefectsData,
        defects: [],
        totalDefects: 0,
      };

      const result = service.generateDefectsPdf(emptyData);
      const chunks: Buffer[] = [];

      result.stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      result.stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
        done();
      });

      result.stream.on('error', done);
    });
  });

  describe('generateActivityPdf', () => {
    const mockActivityData: ActivityReportDto = {
      projectId: 'proj-123',
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31',
      totalTestsExecuted: 150,
      dailyActivity: [
        { date: '2024-01-15', testsExecuted: 25, passed: 20, failed: 5 },
        { date: '2024-01-16', testsExecuted: 30, passed: 28, failed: 2 },
      ],
      testerActivity: [
        { userId: 'user-1', testsExecuted: 50, passed: 45, failed: 5, passRate: 90 },
        { userId: null, testsExecuted: 20, passed: 15, failed: 5, passRate: 75 },
      ],
      generatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    it('should return a stream and filename', () => {
      const result = service.generateActivityPdf(mockActivityData);

      expect(result).toHaveProperty('stream');
      expect(result).toHaveProperty('filename');
      expect(result.filename).toMatch(/^activity-report-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should generate a valid PDF stream', (done) => {
      const result = service.generateActivityPdf(mockActivityData);
      const chunks: Buffer[] = [];

      result.stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      result.stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
        done();
      });

      result.stream.on('error', done);
    });

    it('should handle empty activity lists', (done) => {
      const emptyData: ActivityReportDto = {
        ...mockActivityData,
        dailyActivity: [],
        testerActivity: [],
        totalTestsExecuted: 0,
      };

      const result = service.generateActivityPdf(emptyData);
      const chunks: Buffer[] = [];

      result.stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      result.stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
        done();
      });

      result.stream.on('error', done);
    });
  });

  describe('generateTrendsPdf', () => {
    const mockTrendsData: TrendsReportDto = {
      projectId: 'proj-123',
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31',
      executionTrends: [
        { date: '2024-01-15', testsExecuted: 50, passed: 40, failed: 10, passRate: 80 },
        { date: '2024-01-16', testsExecuted: 60, passed: 54, failed: 6, passRate: 90 },
      ],
      defectTrends: [
        { date: '2024-01-15', newDefects: 3, cumulativeDefects: 3 },
        { date: '2024-01-16', newDefects: 1, cumulativeDefects: 4 },
      ],
      averagePassRate: 85,
      passRateTrend: 10,
      generatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    it('should return a stream and filename', () => {
      const result = service.generateTrendsPdf(mockTrendsData);

      expect(result).toHaveProperty('stream');
      expect(result).toHaveProperty('filename');
      expect(result.filename).toMatch(/^trends-report-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should generate a valid PDF stream', (done) => {
      const result = service.generateTrendsPdf(mockTrendsData);
      const chunks: Buffer[] = [];

      result.stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      result.stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
        done();
      });

      result.stream.on('error', done);
    });

    it('should handle empty trends lists', (done) => {
      const emptyData: TrendsReportDto = {
        ...mockTrendsData,
        executionTrends: [],
        defectTrends: [],
        averagePassRate: 0,
        passRateTrend: 0,
      };

      const result = service.generateTrendsPdf(emptyData);
      const chunks: Buffer[] = [];

      result.stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      result.stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
        done();
      });

      result.stream.on('error', done);
    });

    it('should handle negative pass rate trend', () => {
      const decliningData: TrendsReportDto = {
        ...mockTrendsData,
        passRateTrend: -15,
      };

      const result = service.generateTrendsPdf(decliningData);
      expect(result.stream).toBeDefined();
    });

    it('should handle zero pass rate trend', () => {
      const stableData: TrendsReportDto = {
        ...mockTrendsData,
        passRateTrend: 0,
      };

      const result = service.generateTrendsPdf(stableData);
      expect(result.stream).toBeDefined();
    });
  });

  describe('large data handling', () => {
    it('should handle coverage report with many requirements', (done) => {
      const manyRequirements = Array.from({ length: 100 }, (_, i) => ({
        requirementId: `req-${i}`,
        externalId: `JIRA-${i}`,
        title: `Requirement ${i} - This is a test requirement with a longer description`,
        status: i % 2 === 0 ? 'approved' : 'draft',
        linkedTestCases: Math.floor(Math.random() * 10),
        isCovered: i % 3 !== 0,
      }));

      const largeData: CoverageReportDto = {
        projectId: 'proj-123',
        totalRequirements: 100,
        coveredRequirements: 67,
        uncoveredRequirements: 33,
        coveragePercentage: 67,
        requirements: manyRequirements,
        generatedAt: new Date(),
      };

      const result = service.generateCoveragePdf(largeData);
      const chunks: Buffer[] = [];

      result.stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      result.stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
        expect(buffer.length).toBeGreaterThan(1000);
        done();
      });

      result.stream.on('error', done);
    });

    it('should handle activity report with many days', (done) => {
      const manyDays = Array.from({ length: 90 }, (_, i) => {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + i);
        const isoString = date.toISOString();
        return {
          date: isoString.substring(0, isoString.indexOf('T')),
          testsExecuted: Math.floor(Math.random() * 100),
          passed: Math.floor(Math.random() * 80),
          failed: Math.floor(Math.random() * 20),
        };
      });

      const largeData: ActivityReportDto = {
        projectId: 'proj-123',
        periodStart: '2024-01-01',
        periodEnd: '2024-03-31',
        totalTestsExecuted: 5000,
        dailyActivity: manyDays,
        testerActivity: [],
        generatedAt: new Date(),
      };

      const result = service.generateActivityPdf(largeData);
      const chunks: Buffer[] = [];

      result.stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      result.stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
        done();
      });

      result.stream.on('error', done);
    });
  });
});
