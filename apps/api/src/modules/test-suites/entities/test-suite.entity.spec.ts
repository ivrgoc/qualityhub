import { TestSuite } from './test-suite.entity';
import { Section } from './section.entity';
import { Project } from '../../projects/entities/project.entity';

describe('TestSuite Entity', () => {
  it('should create a test suite instance', () => {
    const suite = new TestSuite();

    suite.id = 'suite-123';
    suite.projectId = 'proj-456';
    suite.name = 'Login Test Suite';
    suite.description = 'Test suite for login functionality';
    suite.createdAt = new Date('2024-01-01');

    expect(suite.id).toBe('suite-123');
    expect(suite.projectId).toBe('proj-456');
    expect(suite.name).toBe('Login Test Suite');
    expect(suite.description).toBe('Test suite for login functionality');
    expect(suite.createdAt).toEqual(new Date('2024-01-01'));
  });

  it('should support optional description', () => {
    const suite = new TestSuite();
    suite.id = 'suite-123';
    suite.name = 'Suite Without Description';

    expect(suite.description).toBeUndefined();
  });

  it('should support null description', () => {
    const suite = new TestSuite();
    suite.id = 'suite-123';
    suite.name = 'Suite With Null Description';
    suite.description = null;

    expect(suite.description).toBeNull();
  });

  it('should have project relation', () => {
    const suite = new TestSuite();
    const project = new Project();
    project.id = 'proj-123';
    project.name = 'Test Project';

    suite.projectId = project.id;
    suite.project = project;

    expect(suite.project).toBe(project);
    expect(suite.project.id).toBe('proj-123');
    expect(suite.project.name).toBe('Test Project');
    expect(suite.projectId).toBe(project.id);
  });

  it('should have sections relation', () => {
    const suite = new TestSuite();
    suite.id = 'suite-123';
    suite.name = 'Suite with Sections';

    const section1 = new Section();
    section1.id = 'section-1';
    section1.suiteId = suite.id;
    section1.name = 'Authentication Tests';
    section1.position = 0;

    const section2 = new Section();
    section2.id = 'section-2';
    section2.suiteId = suite.id;
    section2.name = 'Authorization Tests';
    section2.position = 1;

    suite.sections = [section1, section2];

    expect(suite.sections).toHaveLength(2);
    expect(suite.sections[0].id).toBe('section-1');
    expect(suite.sections[0].name).toBe('Authentication Tests');
    expect(suite.sections[1].id).toBe('section-2');
    expect(suite.sections[1].name).toBe('Authorization Tests');
  });

  it('should handle empty sections array', () => {
    const suite = new TestSuite();
    suite.id = 'suite-123';
    suite.name = 'Empty Suite';
    suite.sections = [];

    expect(suite.sections).toHaveLength(0);
    expect(suite.sections).toEqual([]);
  });
});
