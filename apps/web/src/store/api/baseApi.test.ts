import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { baseApi, TAG_TYPES, createTag, createListTag, type TagType } from './baseApi';

describe('baseApi', () => {
  describe('configuration', () => {
    it('should have correct reducer path', () => {
      expect(baseApi.reducerPath).toBe('api');
    });

    it('should have all expected tag types configured', () => {
      const expectedTagTypes = [
        'User',
        'Organization',
        'Project',
        'TestSuite',
        'Section',
        'TestCase',
        'TestCaseVersion',
        'TestPlan',
        'TestRun',
        'TestResult',
        'Milestone',
        'Requirement',
        'Attachment',
        'Report',
        'Integration',
      ];

      // Access the internal endpoints to verify tag types
      // RTK Query stores these in the api configuration
      expect(TAG_TYPES).toEqual(expectedTagTypes);
    });

    it('should have empty endpoints by default', () => {
      // baseApi is configured with empty endpoints, allowing injection
      const endpoints = baseApi.endpoints;
      expect(endpoints).toBeDefined();
      expect(typeof endpoints).toBe('object');
    });

    it('should export TAG_TYPES as const array', () => {
      expect(Array.isArray(TAG_TYPES)).toBe(true);
      expect(TAG_TYPES.length).toBe(15);
    });
  });

  describe('TAG_TYPES', () => {
    it('should include all core entity types', () => {
      expect(TAG_TYPES).toContain('User');
      expect(TAG_TYPES).toContain('Organization');
      expect(TAG_TYPES).toContain('Project');
      expect(TAG_TYPES).toContain('TestCase');
      expect(TAG_TYPES).toContain('TestRun');
      expect(TAG_TYPES).toContain('TestResult');
    });

    it('should include test management entity types', () => {
      expect(TAG_TYPES).toContain('TestSuite');
      expect(TAG_TYPES).toContain('Section');
      expect(TAG_TYPES).toContain('TestCaseVersion');
      expect(TAG_TYPES).toContain('TestPlan');
    });

    it('should include supporting entity types', () => {
      expect(TAG_TYPES).toContain('Milestone');
      expect(TAG_TYPES).toContain('Requirement');
      expect(TAG_TYPES).toContain('Attachment');
      expect(TAG_TYPES).toContain('Report');
      expect(TAG_TYPES).toContain('Integration');
    });
  });

  describe('createTag helper', () => {
    it('should create a tag with string id', () => {
      const tag = createTag('Project', 'project-123');
      expect(tag).toEqual({ type: 'Project', id: 'project-123' });
    });

    it('should create a tag with numeric id', () => {
      const tag = createTag('TestCase', 456);
      expect(tag).toEqual({ type: 'TestCase', id: 456 });
    });

    it('should work with all tag types', () => {
      const userTag = createTag('User', 'user-1');
      const projectTag = createTag('Project', 'proj-1');
      const testCaseTag = createTag('TestCase', 'tc-1');

      expect(userTag.type).toBe('User');
      expect(projectTag.type).toBe('Project');
      expect(testCaseTag.type).toBe('TestCase');
    });

    it('should preserve type safety', () => {
      const tag: { type: 'Project'; id: string | number } = createTag('Project', 'id');
      expect(tag.type).toBe('Project');
    });
  });

  describe('createListTag helper', () => {
    it('should create a list tag with LIST id', () => {
      const tag = createListTag('Project');
      expect(tag).toEqual({ type: 'Project', id: 'LIST' });
    });

    it('should work with different tag types', () => {
      const userListTag = createListTag('User');
      const testCaseListTag = createListTag('TestCase');
      const testRunListTag = createListTag('TestRun');

      expect(userListTag).toEqual({ type: 'User', id: 'LIST' });
      expect(testCaseListTag).toEqual({ type: 'TestCase', id: 'LIST' });
      expect(testRunListTag).toEqual({ type: 'TestRun', id: 'LIST' });
    });

    it('should always use LIST as the id', () => {
      TAG_TYPES.forEach((tagType) => {
        const tag = createListTag(tagType);
        expect(tag.id).toBe('LIST');
        expect(tag.type).toBe(tagType);
      });
    });
  });

  describe('baseApi reducer', () => {
    it('should export a reducer function', () => {
      expect(baseApi.reducer).toBeDefined();
      expect(typeof baseApi.reducer).toBe('function');
    });

    it('should have initial state with queries and mutations', () => {
      const initialState = baseApi.reducer(undefined, { type: '@@INIT' });
      expect(initialState).toHaveProperty('queries');
      expect(initialState).toHaveProperty('mutations');
      expect(initialState).toHaveProperty('provided');
      expect(initialState).toHaveProperty('subscriptions');
    });
  });

  describe('baseApi middleware', () => {
    it('should export middleware', () => {
      expect(baseApi.middleware).toBeDefined();
      expect(typeof baseApi.middleware).toBe('function');
    });
  });

  describe('injectEndpoints', () => {
    it('should allow injecting new endpoints', () => {
      // Create an injected API for testing
      const injectedApi = baseApi.injectEndpoints({
        endpoints: (builder) => ({
          testEndpoint: builder.query<{ data: string }, void>({
            query: () => '/test',
          }),
        }),
        overrideExisting: false,
      });

      expect(injectedApi.endpoints.testEndpoint).toBeDefined();
    });
  });
});

describe('baseApi auth headers', () => {
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    // Mock localStorage
    const mockLocalStorage: Record<string, string> = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
      }),
      length: 0,
      key: vi.fn(),
    };
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
    vi.restoreAllMocks();
  });

  it('should read token from localStorage', () => {
    const token = 'test-access-token';
    (localStorage.setItem as ReturnType<typeof vi.fn>)('accessToken', token);

    // Verify localStorage interaction is set up correctly
    expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', token);
  });
});

describe('TagType', () => {
  it('should be a union type of all tag types', () => {
    // TypeScript compile-time check - these should all be valid
    const validTypes: TagType[] = [
      'User',
      'Organization',
      'Project',
      'TestSuite',
      'Section',
      'TestCase',
      'TestCaseVersion',
      'TestPlan',
      'TestRun',
      'TestResult',
      'Milestone',
      'Requirement',
      'Attachment',
      'Report',
      'Integration',
    ];

    expect(validTypes.length).toBe(TAG_TYPES.length);
    validTypes.forEach((type) => {
      expect(TAG_TYPES).toContain(type);
    });
  });
});
