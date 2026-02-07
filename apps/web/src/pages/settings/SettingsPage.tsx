import { type FC, useState, useCallback } from 'react';
import { User, Building2, Puzzle, Bell } from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import {
  ProfileSettings,
  OrganizationSettings,
  IntegrationsSettings,
  NotificationSettings,
  type NotificationPreferences,
} from '@/components/features/settings';
import { useToast } from '@/hooks';

// Mock data - in a real app, this would come from API/Redux
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatarUrl: undefined,
};

const mockOrganization = {
  id: '1',
  name: 'Acme Inc.',
  plan: 'Professional',
  memberCount: 12,
};

const mockMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'owner' as const,
    joinedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'admin' as const,
    joinedAt: '2024-02-01',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'tester' as const,
    joinedAt: '2024-03-10',
  },
];

const mockJiraStatus = {
  connected: false,
  siteUrl: undefined,
  email: undefined,
};

const mockNotificationPreferences: NotificationPreferences = {
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

/**
 * Settings page with tabs for Profile, Organization, Integrations, and Notifications.
 */
export const SettingsPage: FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile handlers
  const handleUpdateProfile = useCallback(
    async (_data: { name: string; email: string }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    [toast]
  );

  const handleChangePassword = useCallback(
    async (_data: { currentPassword: string; newPassword: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully.',
      });
    },
    [toast]
  );

  const handleUploadAvatar = useCallback(
    async (_file: File) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Avatar uploaded',
        description: 'Your profile picture has been updated.',
      });
    },
    [toast]
  );

  // Organization handlers
  const handleUpdateOrganization = useCallback(
    async (_data: { name: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Organization updated',
        description: 'Organization settings have been saved.',
      });
    },
    [toast]
  );

  const handleInviteMember = useCallback(
    async (data: { email: string; role: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${data.email}.`,
      });
    },
    [toast]
  );

  const handleUpdateMemberRole = useCallback(
    async (_memberId: string, _role: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast({
        title: 'Role updated',
        description: 'Member role has been updated.',
      });
    },
    [toast]
  );

  const handleRemoveMember = useCallback(
    async (_memberId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Member removed',
        description: 'The team member has been removed from the organization.',
      });
    },
    [toast]
  );

  // Integration handlers
  const handleConnectJira = useCallback(
    async (_data: { siteUrl: string; email: string; apiToken: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        title: 'Jira connected',
        description: 'Successfully connected to your Jira instance.',
      });
    },
    [toast]
  );

  const handleDisconnectJira = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: 'Jira disconnected',
      description: 'Jira integration has been disconnected.',
    });
  }, [toast]);

  const handleTestJiraConnection = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return true;
  }, []);

  // Notification handlers
  const handleUpdateNotifications = useCallback(
    async (_preferences: NotificationPreferences) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast({
        title: 'Preferences saved',
        description: 'Your notification preferences have been updated.',
      });
    },
    [toast]
  );

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
            user={mockUser}
            onUpdateProfile={handleUpdateProfile}
            onChangePassword={handleChangePassword}
            onUploadAvatar={handleUploadAvatar}
          />
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization">
          <OrganizationSettings
            organization={mockOrganization}
            members={mockMembers}
            currentUserId={mockUser.id}
            onUpdateOrganization={handleUpdateOrganization}
            onInviteMember={handleInviteMember}
            onUpdateMemberRole={handleUpdateMemberRole}
            onRemoveMember={handleRemoveMember}
          />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <IntegrationsSettings
            jira={mockJiraStatus}
            onConnectJira={handleConnectJira}
            onDisconnectJira={handleDisconnectJira}
            onTestJiraConnection={handleTestJiraConnection}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationSettings
            preferences={mockNotificationPreferences}
            onUpdatePreferences={handleUpdateNotifications}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
