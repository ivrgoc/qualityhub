import { type FC, useCallback } from 'react';
import { Bell, Mail, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Switch,
} from '@/components/ui';

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

export interface NotificationSettingsProps {
  preferences: NotificationPreferences;
  onUpdatePreferences: (preferences: NotificationPreferences) => Promise<void>;
  isUpdating?: boolean;
  className?: string;
}

interface NotificationRow {
  key: string;
  label: string;
  description: string;
  icon: typeof Bell;
  emailKey?: keyof NotificationPreferences['email'];
  inAppKey?: keyof NotificationPreferences['inApp'];
}

const NOTIFICATION_ROWS: NotificationRow[] = [
  {
    key: 'testRunCompleted',
    label: 'Test Run Completed',
    description: 'When a test run you created or are assigned to completes',
    icon: CheckCircle2,
    emailKey: 'testRunCompleted',
    inAppKey: 'testRunCompleted',
  },
  {
    key: 'testFailed',
    label: 'Test Failed',
    description: 'When a test case fails during execution',
    icon: AlertTriangle,
    emailKey: 'testFailed',
    inAppKey: 'testFailed',
  },
  {
    key: 'assignedToTest',
    label: 'Assigned to Test',
    description: 'When you are assigned to a test run',
    icon: Bell,
    emailKey: 'assignedToTest',
    inAppKey: 'assignedToTest',
  },
  {
    key: 'mentionedInComment',
    label: 'Mentioned in Comment',
    description: 'When someone mentions you in a comment',
    icon: MessageSquare,
    emailKey: 'mentionedInComment',
    inAppKey: 'mentionedInComment',
  },
  {
    key: 'weeklyReport',
    label: 'Weekly Report',
    description: 'Receive a weekly summary of testing activity',
    icon: Mail,
    emailKey: 'weeklyReport',
  },
];

/**
 * Notification settings component with email preference toggles.
 */
export const NotificationSettings: FC<NotificationSettingsProps> = ({
  preferences,
  onUpdatePreferences,
  isUpdating,
  className,
}) => {
  const handleToggle = useCallback(
    (type: 'email' | 'inApp', key: string, value: boolean) => {
      const newPreferences = {
        ...preferences,
        [type]: {
          ...preferences[type],
          [key]: value,
        },
      };
      onUpdatePreferences(newPreferences);
    },
    [preferences, onUpdatePreferences]
  );

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to be notified about activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-medium">Notification</th>
                  <th className="py-3 text-center font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                  </th>
                  <th className="py-3 text-center font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span>In-App</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {NOTIFICATION_ROWS.map((row) => {
                  const Icon = row.icon;

                  return (
                    <tr key={row.key} className="border-b last:border-0">
                      <td className="py-4">
                        <div className="flex items-start gap-3">
                          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{row.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {row.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        {row.emailKey && (
                          <Switch
                            checked={preferences.email[row.emailKey]}
                            onCheckedChange={(checked) =>
                              handleToggle('email', row.emailKey!, checked)
                            }
                            disabled={isUpdating}
                          />
                        )}
                      </td>
                      <td className="py-4 text-center">
                        {row.inAppKey && (
                          <Switch
                            checked={preferences.inApp[row.inAppKey]}
                            onCheckedChange={(checked) =>
                              handleToggle('inApp', row.inAppKey!, checked)
                            }
                            disabled={isUpdating}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Quiet Hours</CardTitle>
          <CardDescription>
            Pause notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Quiet Hours</p>
              <p className="text-sm text-muted-foreground">
                No notifications between 10:00 PM and 8:00 AM
              </p>
            </div>
            <Switch disabled={isUpdating} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
