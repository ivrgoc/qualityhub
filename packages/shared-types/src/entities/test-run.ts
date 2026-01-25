export interface TestRun {
  id: string;
  projectId: string;
  planId?: string;
  suiteId?: string;
  name: string;
  description?: string;
  assigneeId?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CreateTestRunDto {
  name: string;
  description?: string;
  planId?: string;
  suiteId?: string;
  assigneeId?: string;
}

export interface UpdateTestRunDto {
  name?: string;
  description?: string;
  assigneeId?: string;
  startedAt?: string;
  completedAt?: string;
}
