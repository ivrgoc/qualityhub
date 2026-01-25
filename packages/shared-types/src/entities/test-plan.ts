export interface TestPlan {
  id: string;
  projectId: string;
  milestoneId?: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface CreateTestPlanDto {
  name: string;
  description?: string;
  milestoneId?: string;
}

export interface UpdateTestPlanDto {
  name?: string;
  description?: string;
  milestoneId?: string;
}
