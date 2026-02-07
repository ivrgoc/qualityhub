import { type FC, useState, useCallback } from 'react';
import { User, Building2, Puzzle, Bell } from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
} from '@/components/ui';
import {
  ProfileSettings,
  OrganizationSettings,
  IntegrationsSettings,
  NotificationSettings,
  type NotificationPreferences,
} from '@/components/features/settings';
import { useToast } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import {
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
} from '@/store/api/settingsApi';

/**
 * Settings page with tabs for Profile, Organization, Integrations, and Notifications.
 */
export const SettingsPage: FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  const user = useAppSelector(selectUser);
  const orgId = user?.orgId;

  // API queries
  const { data: organization, isLoading: isLoadingOrg } = useGetOrganizationQuery(
    orgId!,
    { skip: !orgId }
  );
  const { data: members, isLoading: isLoadingMembers } = useGetOrgMembersQuery(
    orgId!,
    { skip: !orgId }
  );
  const { data: notificationPrefs } = useGetNotificationPreferencesQuery();
  const { data: jiraStatus } = useGetJiraStatusQuery();

  // API mutations
  const [updateProfile] = useUpdateProfileMutation();
  const [changePassword] = useChangePasswordMutation();
  const [uploadAvatar] = useUploadAvatarMutation();
  const [updateOrg] = useUpdateOrganizationMutation();
  const [inviteMember] = useInviteMemberMutation();
  const [updateMemberRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [updateNotifications] = useUpdateNotificationPreferencesMutation();
  const [connectJira] = useConnectJiraMutation();
  const [disconnectJira] = useDisconnectJiraMutation();
  const [testJira] = useTestJiraConnectionMutation();

  // Profile handlers
  const handleUpdateProfile = useCallback(
    async (data: { name: string; email: string }) => {
      try {
        await updateProfile(data).unwrap();
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
      } catch {
        toast({
          title: 'Update failed',
          description: 'Failed to update profile. Please try again.',
          variant: 'error',
        });
      }
    },
    [updateProfile, toast]
  );

  const handleChangePassword = useCallback(
    async (data: { currentPassword: string; newPassword: string }) => {
      try {
        await changePassword(data).unwrap();
        toast({
          title: 'Password changed',
          description: 'Your password has been changed successfully.',
        });
      } catch {
        toast({
          title: 'Password change failed',
          description: 'Failed to change password. Check your current password.',
          variant: 'error',
        });
      }
    },
    [changePassword, toast]
  );

  const handleUploadAvatar = useCallback(
    async (file: File) => {
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        await uploadAvatar(formData).unwrap();
        toast({
          title: 'Avatar uploaded',
          description: 'Your profile picture has been updated.',
        });
      } catch {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload avatar. Please try again.',
          variant: 'error',
        });
      }
    },
    [uploadAvatar, toast]
  );

  // Organization handlers
  const handleUpdateOrganization = useCallback(
    async (data: { name: string }) => {
      if (!orgId) return;
      try {
        await updateOrg({ orgId, name: data.name }).unwrap();
        toast({
          title: 'Organization updated',
          description: 'Organization settings have been saved.',
        });
      } catch {
        toast({
          title: 'Update failed',
          description: 'Failed to update organization settings.',
          variant: 'error',
        });
      }
    },
    [orgId, updateOrg, toast]
  );

  const handleInviteMember = useCallback(
    async (data: { email: string; role: string }) => {
      if (!orgId) return;
      try {
        await inviteMember({ orgId, ...data }).unwrap();
        toast({
          title: 'Invitation sent',
          description: `An invitation has been sent to ${data.email}.`,
        });
      } catch {
        toast({
          title: 'Invitation failed',
          description: 'Failed to send invitation. Please try again.',
          variant: 'error',
        });
      }
    },
    [orgId, inviteMember, toast]
  );

  const handleUpdateMemberRole = useCallback(
    async (memberId: string, role: string) => {
      if (!orgId) return;
      try {
        await updateMemberRole({ orgId, memberId, role }).unwrap();
        toast({
          title: 'Role updated',
          description: 'Member role has been updated.',
        });
      } catch {
        toast({
          title: 'Update failed',
          description: 'Failed to update member role.',
          variant: 'error',
        });
      }
    },
    [orgId, updateMemberRole, toast]
  );

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      if (!orgId) return;
      try {
        await removeMember({ orgId, memberId }).unwrap();
        toast({
          title: 'Member removed',
          description: 'The team member has been removed from the organization.',
        });
      } catch {
        toast({
          title: 'Removal failed',
          description: 'Failed to remove team member.',
          variant: 'error',
        });
      }
    },
    [orgId, removeMember, toast]
  );

  // Integration handlers
  const handleConnectJira = useCallback(
    async (data: { siteUrl: string; email: string; apiToken: string }) => {
      try {
        await connectJira(data).unwrap();
        toast({
          title: 'Jira connected',
          description: 'Successfully connected to your Jira instance.',
        });
      } catch {
        toast({
          title: 'Connection failed',
          description: 'Failed to connect to Jira. Check your credentials.',
          variant: 'error',
        });
      }
    },
    [connectJira, toast]
  );

  const handleDisconnectJira = useCallback(async () => {
    try {
      await disconnectJira().unwrap();
      toast({
        title: 'Jira disconnected',
        description: 'Jira integration has been disconnected.',
      });
    } catch {
      toast({
        title: 'Disconnect failed',
        description: 'Failed to disconnect Jira.',
        variant: 'error',
      });
    }
  }, [disconnectJira, toast]);

  const handleTestJiraConnection = useCallback(async () => {
    try {
      const result = await testJira().unwrap();
      return result.success;
    } catch {
      return false;
    }
  }, [testJira]);

  // Notification handlers
  const handleUpdateNotifications = useCallback(
    async (preferences: NotificationPreferences) => {
      try {
        await updateNotifications(preferences).unwrap();
        toast({
          title: 'Preferences saved',
          description: 'Your notification preferences have been updated.',
        });
      } catch {
        toast({
          title: 'Save failed',
          description: 'Failed to save notification preferences.',
          variant: 'error',
        });
      }
    },
    [updateNotifications, toast]
  );

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const orgData = organization
    ? {
        id: organization.id,
        name: organization.name,
        plan: organization.plan ?? 'Free',
        memberCount: members?.length ?? 0,
      }
    : { id: orgId ?? '', name: 'Loading...', plan: 'Free', memberCount: 0 };

  const membersData = members ?? [];
  const jiraData = jiraStatus ?? { connected: false };
  const notifData: NotificationPreferences = notificationPrefs ?? {
    email: {
      testRunCompleted: true,
      testFailed: true,
      assignedToTest: true,
      weeklyReport: true,
      mentionedInComment: true,
    },
    inApp: {
      testRunCompleted: true,
      testFailed: true,
      assignedToTest: true,
      mentionedInComment: true,
    },
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Puzzle className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <ProfileSettings
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              avatarUrl: undefined,
            }}
            onUpdateProfile={handleUpdateProfile}
            onChangePassword={handleChangePassword}
            onUploadAvatar={handleUploadAvatar}
          />
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization">
          {isLoadingOrg || isLoadingMembers ? (
            <Skeleton className="h-96" />
          ) : (
            <OrganizationSettings
              organization={orgData}
              members={membersData}
              currentUserId={user.id}
              onUpdateOrganization={handleUpdateOrganization}
              onInviteMember={handleInviteMember}
              onUpdateMemberRole={handleUpdateMemberRole}
              onRemoveMember={handleRemoveMember}
            />
          )}
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <IntegrationsSettings
            jira={jiraData}
            onConnectJira={handleConnectJira}
            onDisconnectJira={handleDisconnectJira}
            onTestJiraConnection={handleTestJiraConnection}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationSettings
            preferences={notifData}
            onUpdatePreferences={handleUpdateNotifications}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
