export interface TestStep {
  id: string;
  content: string;
  expected: string;
}

export interface CreateTestStepDto {
  content: string;
  expected: string;
}
