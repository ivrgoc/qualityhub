import { TestStatus } from '../enums';

export interface TestResult {
  id: string;
  runId: string;
  caseId: string;
  caseVersion: number;
  status: TestStatus;
  comment?: string;
  elapsedSeconds?: number;
  executedBy: string;
  executedAt: string;
  createdAt: string;
}

export interface CreateTestResultDto {
  caseId: string;
  status: TestStatus;
  comment?: string;
  elapsedSeconds?: number;
}

export interface UpdateTestResultDto {
  status?: TestStatus;
  comment?: string;
  elapsedSeconds?: number;
}
