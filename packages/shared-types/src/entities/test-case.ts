import { Priority, TestCaseTemplate } from '../enums';
import { TestStep, CreateTestStepDto } from './test-step';

export interface TestCase {
  id: string;
  sectionId: string;
  title: string;
  templateType: TestCaseTemplate;
  preconditions?: string;
  steps: TestStep[];
  expectedResult?: string;
  priority: Priority;
  estimate?: number;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestCaseDto {
  sectionId: string;
  title: string;
  templateType?: TestCaseTemplate;
  preconditions?: string;
  steps?: CreateTestStepDto[];
  expectedResult?: string;
  priority?: Priority;
  estimate?: number;
}

export interface UpdateTestCaseDto {
  title?: string;
  templateType?: TestCaseTemplate;
  preconditions?: string;
  steps?: CreateTestStepDto[];
  expectedResult?: string;
  priority?: Priority;
  estimate?: number;
}
