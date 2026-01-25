export enum TestCaseTemplate {
  STEPS = 'steps',
  TEXT = 'text',
  BDD = 'bdd',
  EXPLORATORY = 'exploratory',
}

export const TEST_CASE_TEMPLATE_VALUES = Object.values(TestCaseTemplate);

export function isTestCaseTemplate(value: unknown): value is TestCaseTemplate {
  return (
    typeof value === 'string' && TEST_CASE_TEMPLATE_VALUES.includes(value as TestCaseTemplate)
  );
}
