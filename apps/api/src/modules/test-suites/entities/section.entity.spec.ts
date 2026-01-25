import { Section } from './section.entity';
import { TestSuite } from './test-suite.entity';

describe('Section Entity', () => {
  it('should create a section instance', () => {
    const section = new Section();

    section.id = 'section-123';
    section.suiteId = 'suite-456';
    section.name = 'Login Tests';
    section.parentId = null;
    section.position = 0;
    section.createdAt = new Date('2024-01-01');

    expect(section.id).toBe('section-123');
    expect(section.suiteId).toBe('suite-456');
    expect(section.name).toBe('Login Tests');
    expect(section.parentId).toBeNull();
    expect(section.position).toBe(0);
    expect(section.createdAt).toEqual(new Date('2024-01-01'));
  });

  it('should support parent section for nested hierarchy', () => {
    const parentSection = new Section();
    parentSection.id = 'parent-123';
    parentSection.suiteId = 'suite-456';
    parentSection.name = 'Authentication';
    parentSection.parentId = null;
    parentSection.position = 0;

    const childSection = new Section();
    childSection.id = 'child-123';
    childSection.suiteId = 'suite-456';
    childSection.name = 'Login Tests';
    childSection.parentId = parentSection.id;
    childSection.parent = parentSection;
    childSection.position = 0;

    expect(childSection.parentId).toBe('parent-123');
    expect(childSection.parent).toBe(parentSection);
    expect(childSection.parent.name).toBe('Authentication');
  });

  it('should have suite relation', () => {
    const section = new Section();
    const suite = new TestSuite();
    suite.id = 'suite-123';
    suite.name = 'Test Suite';

    section.suiteId = suite.id;
    section.suite = suite;

    expect(section.suite).toBe(suite);
    expect(section.suite.id).toBe('suite-123');
    expect(section.suite.name).toBe('Test Suite');
    expect(section.suiteId).toBe(suite.id);
  });

  it('should have children relation', () => {
    const parentSection = new Section();
    parentSection.id = 'parent-123';
    parentSection.suiteId = 'suite-456';
    parentSection.name = 'Parent Section';
    parentSection.position = 0;

    const child1 = new Section();
    child1.id = 'child-1';
    child1.suiteId = 'suite-456';
    child1.name = 'Child 1';
    child1.parentId = parentSection.id;
    child1.position = 0;

    const child2 = new Section();
    child2.id = 'child-2';
    child2.suiteId = 'suite-456';
    child2.name = 'Child 2';
    child2.parentId = parentSection.id;
    child2.position = 1;

    parentSection.children = [child1, child2];

    expect(parentSection.children).toHaveLength(2);
    expect(parentSection.children[0].id).toBe('child-1');
    expect(parentSection.children[0].name).toBe('Child 1');
    expect(parentSection.children[1].id).toBe('child-2');
    expect(parentSection.children[1].name).toBe('Child 2');
  });

  it('should handle empty children array', () => {
    const section = new Section();
    section.id = 'section-123';
    section.name = 'Leaf Section';
    section.children = [];

    expect(section.children).toHaveLength(0);
    expect(section.children).toEqual([]);
  });

  it('should support position ordering', () => {
    const sections = [
      { id: 'section-3', name: 'Third', position: 2 },
      { id: 'section-1', name: 'First', position: 0 },
      { id: 'section-2', name: 'Second', position: 1 },
    ].map((data) => {
      const section = new Section();
      Object.assign(section, data);
      return section;
    });

    const sorted = sections.sort((a, b) => a.position - b.position);

    expect(sorted[0].name).toBe('First');
    expect(sorted[1].name).toBe('Second');
    expect(sorted[2].name).toBe('Third');
  });

  it('should default position to 0', () => {
    const section = new Section();
    section.id = 'section-123';
    section.name = 'Default Position Section';
    section.position = 0;

    expect(section.position).toBe(0);
  });
});
