export interface TestSuite {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  parentId?: string;
  position: number;
  createdAt: string;
}

export interface CreateTestSuiteDto {
  name: string;
  description?: string;
  parentId?: string;
  position?: number;
}

export interface UpdateTestSuiteDto {
  name?: string;
  description?: string;
  parentId?: string;
  position?: number;
}
