import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

/**
 * Tag types for RTK Query cache invalidation.
 * These correspond to the core entities in the QualityHub domain.
 */
export const TAG_TYPES = [
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
] as const;

export type TagType = (typeof TAG_TYPES)[number];

/**
 * Base query with authentication headers.
 * Retrieves the access token from localStorage and attaches it to requests.
 */
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers, _api) => {
    // First try to get token from localStorage (persisted)
    const token = localStorage.getItem('accessToken');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Set default content type if not already set
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return headers;
  },
  credentials: 'include', // Include cookies for refresh token
});

/**
 * Enhanced base query with automatic re-authentication on 401 errors.
 * Attempts to refresh the token and retry the original request.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshResult = await baseQueryWithAuth(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as { accessToken: string };
      // Store the new token
      localStorage.setItem('accessToken', data.accessToken);

      // Retry the original request with the new token
      result = await baseQueryWithAuth(args, api, extraOptions);
    } else {
      // Refresh failed - clear auth state
      localStorage.removeItem('accessToken');
      // Dispatch logout action if needed
      // api.dispatch(clearUser());
    }
  }

  return result;
};

/**
 * Base API instance for RTK Query.
 * All feature-specific API slices should use `baseApi.injectEndpoints()` to add their endpoints.
 *
 * @example
 * ```typescript
 * export const testCasesApi = baseApi.injectEndpoints({
 *   endpoints: (builder) => ({
 *     getTestCases: builder.query<PaginatedResponse<TestCase>, GetTestCasesParams>({
 *       query: ({ projectId, ...params }) => ({
 *         url: `/projects/${projectId}/cases`,
 *         params,
 *       }),
 *       providesTags: (result) =>
 *         result
 *           ? [...result.items.map(({ id }) => ({ type: 'TestCase' as const, id })), 'TestCase']
 *           : ['TestCase'],
 *     }),
 *   }),
 * });
 * ```
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: TAG_TYPES,
  endpoints: () => ({}),
  // Keep unused data in cache for 60 seconds
  keepUnusedDataFor: 60,
  // Refetch on mount if data is older than 30 seconds
  refetchOnMountOrArgChange: 30,
  // Refetch when window regains focus
  refetchOnFocus: true,
  // Refetch when reconnecting
  refetchOnReconnect: true,
});

/**
 * Helper function to create a tag with an ID.
 * Useful for invalidating specific cache entries.
 */
export function createTag<T extends TagType>(
  type: T,
  id: string | number
): { type: T; id: string | number } {
  return { type, id };
}

/**
 * Helper function to create a list tag.
 * Convention: use 'LIST' as the ID for list-level cache entries.
 */
export function createListTag<T extends TagType>(type: T): { type: T; id: 'LIST' } {
  return { type, id: 'LIST' };
}
