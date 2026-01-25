import { QueryRunner, TableIndex } from 'typeorm';
import { AddIndexesForPerformance1737838900000 } from './1737838900000-AddIndexesForPerformance';

describe('AddIndexesForPerformance1737838900000', () => {
  let migration: AddIndexesForPerformance1737838900000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new AddIndexesForPerformance1737838900000();
    mockQueryRunner = {
      createIndex: jest.fn(),
      dropIndex: jest.fn(),
    } as unknown as jest.Mocked<QueryRunner>;
  });

  describe('name', () => {
    it('should have the correct migration name', () => {
      expect(migration.name).toBe('AddIndexesForPerformance1737838900000');
    });
  });

  describe('up', () => {
    it('should create index on users.role', async () => {
      await migration.up(mockQueryRunner);

      const indexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_USERS_ROLE',
      );
      expect(indexCall).toBeDefined();
      expect(indexCall?.[0]).toBe('users');
      const index = indexCall?.[1] as TableIndex;
      expect(index.columnNames).toEqual(['role']);
    });

    it('should create index on milestones.due_date', async () => {
      await migration.up(mockQueryRunner);

      const indexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_MILESTONES_DUE_DATE',
      );
      expect(indexCall).toBeDefined();
      expect(indexCall?.[0]).toBe('milestones');
      const index = indexCall?.[1] as TableIndex;
      expect(index.columnNames).toEqual(['due_date']);
    });

    it('should create composite index on milestones for project and completion status', async () => {
      await migration.up(mockQueryRunner);

      const indexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) =>
          (call[1] as TableIndex).name === 'IDX_MILESTONES_PROJECT_COMPLETED',
      );
      expect(indexCall).toBeDefined();
      expect(indexCall?.[0]).toBe('milestones');
      const index = indexCall?.[1] as TableIndex;
      expect(index.columnNames).toEqual(['project_id', 'is_completed']);
    });

    it('should create index on test_cases.created_at', async () => {
      await migration.up(mockQueryRunner);

      const indexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_TEST_CASES_CREATED_AT',
      );
      expect(indexCall).toBeDefined();
      expect(indexCall?.[0]).toBe('test_cases');
      const index = indexCall?.[1] as TableIndex;
      expect(index.columnNames).toEqual(['created_at']);
    });

    it('should create composite index on test_cases for section and priority', async () => {
      await migration.up(mockQueryRunner);

      const indexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) =>
          (call[1] as TableIndex).name === 'IDX_TEST_CASES_SECTION_PRIORITY',
      );
      expect(indexCall).toBeDefined();
      expect(indexCall?.[0]).toBe('test_cases');
      const index = indexCall?.[1] as TableIndex;
      expect(index.columnNames).toEqual(['section_id', 'priority']);
    });

    it('should create index on test_runs.created_at', async () => {
      await migration.up(mockQueryRunner);

      const indexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) => (call[1] as TableIndex).name === 'IDX_TEST_RUNS_CREATED_AT',
      );
      expect(indexCall).toBeDefined();
      expect(indexCall?.[0]).toBe('test_runs');
      const index = indexCall?.[1] as TableIndex;
      expect(index.columnNames).toEqual(['created_at']);
    });

    it('should create index on test_results.executed_at', async () => {
      await migration.up(mockQueryRunner);

      const indexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) =>
          (call[1] as TableIndex).name === 'IDX_TEST_RESULTS_EXECUTED_AT',
      );
      expect(indexCall).toBeDefined();
      expect(indexCall?.[0]).toBe('test_results');
      const index = indexCall?.[1] as TableIndex;
      expect(index.columnNames).toEqual(['executed_at']);
    });

    it('should create composite index on test_results for run and status', async () => {
      await migration.up(mockQueryRunner);

      const indexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) =>
          (call[1] as TableIndex).name === 'IDX_TEST_RESULTS_RUN_STATUS',
      );
      expect(indexCall).toBeDefined();
      expect(indexCall?.[0]).toBe('test_results');
      const index = indexCall?.[1] as TableIndex;
      expect(index.columnNames).toEqual(['run_id', 'status']);
    });

    it('should create index on attachments.created_at', async () => {
      await migration.up(mockQueryRunner);

      const indexCall = mockQueryRunner.createIndex.mock.calls.find(
        (call) =>
          (call[1] as TableIndex).name === 'IDX_ATTACHMENTS_CREATED_AT',
      );
      expect(indexCall).toBeDefined();
      expect(indexCall?.[0]).toBe('attachments');
      const index = indexCall?.[1] as TableIndex;
      expect(index.columnNames).toEqual(['created_at']);
    });

    it('should create all 9 indexes', async () => {
      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.createIndex).toHaveBeenCalledTimes(9);
    });
  });

  describe('down', () => {
    it('should drop index on attachments.created_at', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'attachments',
        'IDX_ATTACHMENTS_CREATED_AT',
      );
    });

    it('should drop composite index on test_results for run and status', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_results',
        'IDX_TEST_RESULTS_RUN_STATUS',
      );
    });

    it('should drop index on test_results.executed_at', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_results',
        'IDX_TEST_RESULTS_EXECUTED_AT',
      );
    });

    it('should drop index on test_runs.created_at', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_runs',
        'IDX_TEST_RUNS_CREATED_AT',
      );
    });

    it('should drop composite index on test_cases for section and priority', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_cases',
        'IDX_TEST_CASES_SECTION_PRIORITY',
      );
    });

    it('should drop index on test_cases.created_at', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'test_cases',
        'IDX_TEST_CASES_CREATED_AT',
      );
    });

    it('should drop composite index on milestones for project and completion status', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'milestones',
        'IDX_MILESTONES_PROJECT_COMPLETED',
      );
    });

    it('should drop index on milestones.due_date', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'milestones',
        'IDX_MILESTONES_DUE_DATE',
      );
    });

    it('should drop index on users.role', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledWith(
        'users',
        'IDX_USERS_ROLE',
      );
    });

    it('should drop all 9 indexes', async () => {
      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.dropIndex).toHaveBeenCalledTimes(9);
    });

    it('should drop indexes in reverse order of creation', async () => {
      await migration.down(mockQueryRunner);

      const calls = mockQueryRunner.dropIndex.mock.calls;
      const indexOrder = calls.map((call) => call[1]);

      expect(indexOrder).toEqual([
        'IDX_ATTACHMENTS_CREATED_AT',
        'IDX_TEST_RESULTS_RUN_STATUS',
        'IDX_TEST_RESULTS_EXECUTED_AT',
        'IDX_TEST_RUNS_CREATED_AT',
        'IDX_TEST_CASES_SECTION_PRIORITY',
        'IDX_TEST_CASES_CREATED_AT',
        'IDX_MILESTONES_PROJECT_COMPLETED',
        'IDX_MILESTONES_DUE_DATE',
        'IDX_USERS_ROLE',
      ]);
    });
  });
});
