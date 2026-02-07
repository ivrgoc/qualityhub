import { baseApi } from './baseApi';
import type { User } from '@/types';

/**
 * Request payload for updating user profile.
 */
export interface UpdateProfileRequest {
  name: string;
  email: string;
}

/**
 * Request payload for changing password.
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Organization data for settings.
 */
export interface OrganizationInfo {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  memberCount?: number;
}

/**
 * Organization member.
 */
export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'tester' | 'viewer';
  joinedAt: string;
}

/**
 * Request payload for updating organization.
 */
export interface UpdateOrganizationRequest {
  orgId: string;
  name: string;
}

/**
 * Request payload for inviting a member.
 */
export interface InviteMemberRequest {
  orgId: string;
  email: string;
  role: string;
}

/**
 * Request payload for updating a member's role.
 */
export interface UpdateMemberRoleRequest {
  orgId: string;
  memberId: string;
  role: string;
}

/**
 * Notification preferences.
 */
export interface NotificationPreferences {
  email: {
    testRunCompleted: boolean;
    testFailed: boolean;
    assignedToTest: boolean;
    weeklyReport: boolean;
    mentionedInComment: boolean;
  };
  inApp: {
    testRunCompleted: boolean;
    testFailed: boolean;
    assignedToTest: boolean;
    mentionedInComment: boolean;
  };
}

/**
 * Jira integration status.
 */
export interface JiraStatus {
  connected: boolean;
  siteUrl?: string;
  email?: string;
}

/**
 * Settings API slice.
 */
export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Update user profile (name, email).
     */
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (body) => ({
        url: '/auth/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'User', id: 'ME' }],
    }),

    /**
     * Change user password.
     */
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),

    /**
     * Upload user avatar.
     */
    uploadAvatar: builder.mutation<{ avatarUrl: string }, FormData>({
      query: (formData) => ({
        url: '/auth/me/avatar',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: [{ type: 'User', id: 'ME' }],
    }),

    /**
     * Get current user's organization.
     */
    getOrganization: builder.query<OrganizationInfo, string>({
      query: (orgId) => `/organizations/${orgId}`,
      providesTags: (_result, _error, orgId) => [
        { type: 'Organization', id: orgId },
      ],
    }),

    /**
     * Update organization settings.
     */
    updateOrganization: builder.mutation<OrganizationInfo, UpdateOrganizationRequest>({
      query: ({ orgId, ...body }) => ({
        url: `/organizations/${orgId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: 'Organization', id: orgId },
      ],
    }),

    /**
     * Get organization members.
     */
    getOrgMembers: builder.query<OrgMember[], string>({
      query: (orgId) => `/organizations/${orgId}/members`,
      providesTags: (_result, _error, orgId) => [
        { type: 'Organization', id: `${orgId}-members` },
      ],
    }),

    /**
     * Invite a new member to the organization.
     */
    inviteMember: builder.mutation<void, InviteMemberRequest>({
      query: ({ orgId, ...body }) => ({
        url: `/organizations/${orgId}/members/invite`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: 'Organization', id: `${orgId}-members` },
      ],
    }),

    /**
     * Update a member's role.
     */
    updateMemberRole: builder.mutation<void, UpdateMemberRoleRequest>({
      query: ({ orgId, memberId, role }) => ({
        url: `/organizations/${orgId}/members/${memberId}`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: 'Organization', id: `${orgId}-members` },
      ],
    }),

    /**
     * Remove a member from the organization.
     */
    removeMember: builder.mutation<void, { orgId: string; memberId: string }>({
      query: ({ orgId, memberId }) => ({
        url: `/organizations/${orgId}/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: 'Organization', id: `${orgId}-members` },
      ],
    }),

    /**
     * Get notification preferences.
     */
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => '/settings/notifications',
      providesTags: ['User'],
    }),

    /**
     * Update notification preferences.
     */
    updateNotificationPreferences: builder.mutation<void, NotificationPreferences>({
      query: (body) => ({
        url: '/settings/notifications',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Get Jira integration status.
     */
    getJiraStatus: builder.query<JiraStatus, void>({
      query: () => '/integrations/jira/status',
      providesTags: ['Integration'],
    }),

    /**
     * Connect Jira integration.
     */
    connectJira: builder.mutation<void, { siteUrl: string; email: string; apiToken: string }>({
      query: (body) => ({
        url: '/integrations/jira/connect',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Integration'],
    }),

    /**
     * Disconnect Jira integration.
     */
    disconnectJira: builder.mutation<void, void>({
      query: () => ({
        url: '/integrations/jira/disconnect',
        method: 'POST',
      }),
      invalidatesTags: ['Integration'],
    }),

    /**
     * Test Jira connection.
     */
    testJiraConnection: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/integrations/jira/test',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useGetOrgMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useGetJiraStatusQuery,
  useConnectJiraMutation,
  useDisconnectJiraMutation,
  useTestJiraConnectionMutation,
} = settingsApi;
