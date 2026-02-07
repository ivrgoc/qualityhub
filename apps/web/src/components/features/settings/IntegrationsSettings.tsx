import { type FC, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Link2,
  Unlink,
  Loader2,
  CheckCircle,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Alert,
  AlertDescription,
  Badge,
} from '@/components/ui';

const jiraConnectionSchema = z.object({
  siteUrl: z.string().url('Please enter a valid Jira URL'),
  email: z.string().email('Please enter a valid email'),
  apiToken: z.string().min(1, 'API token is required'),
});

type JiraConnectionFormData = z.infer<typeof jiraConnectionSchema>;

export interface IntegrationStatus {
  connected: boolean;
  lastSynced?: string;
  error?: string;
}

export interface IntegrationsSettingsProps {
  jira: IntegrationStatus & {
    siteUrl?: string;
    email?: string;
  };
  onConnectJira: (data: JiraConnectionFormData) => Promise<void>;
  onDisconnectJira: () => Promise<void>;
  onTestJiraConnection: () => Promise<boolean>;
  isConnecting?: boolean;
  isDisconnecting?: boolean;
  isTesting?: boolean;
  className?: string;
}

/**
 * Integrations settings component with Jira connection form.
 */
export const IntegrationsSettings: FC<IntegrationsSettingsProps> = ({
  jira,
  onConnectJira,
  onDisconnectJira,
  onTestJiraConnection,
  isConnecting,
  isDisconnecting,
  isTesting,
  className,
}) => {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JiraConnectionFormData>({
    resolver: zodResolver(jiraConnectionSchema),
    defaultValues: {
      siteUrl: jira.siteUrl || '',
      email: jira.email || '',
      apiToken: '',
    },
  });

  const handleConnect = useCallback(
    async (data: JiraConnectionFormData) => {
      await onConnectJira(data);
      setTestResult(null);
    },
    [onConnectJira]
  );

  const handleDisconnect = useCallback(async () => {
    await onDisconnectJira();
    reset();
    setTestResult(null);
  }, [onDisconnectJira, reset]);

  const handleTest = useCallback(async () => {
    setTestResult(null);
    const success = await onTestJiraConnection();
    setTestResult({
      success,
      message: success
        ? 'Connection successful! Jira integration is working.'
        : 'Connection failed. Please check your credentials.',
    });
  }, [onTestJiraConnection]);

  return (
    <div className={className}>
      {/* Jira Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-blue-600"
                  fill="currentColor"
                >
                  <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.727a1.214 1.214 0 0 0-1.005-1.214zm5.723-5.756H5.736a5.218 5.218 0 0 0 5.233 5.214h2.129v2.058a5.218 5.218 0 0 0 5.214 5.214V6.971a1.214 1.214 0 0 0-1.018-1.214zm5.707-5.757H11.443a5.218 5.218 0 0 0 5.214 5.215h2.129v2.057A5.218 5.218 0 0 0 24 12.486V1.214A1.214 1.214 0 0 0 23.001 0z" />
                </svg>
              </div>
              <div>
                <CardTitle>Jira</CardTitle>
                <CardDescription>
                  Connect to Jira for issue tracking and defect management
                </CardDescription>
              </div>
            </div>
            <Badge variant={jira.connected ? 'success' : 'default'}>
              {jira.connected ? 'Connected' : 'Not Connected'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {jira.connected ? (
            <div className="space-y-4">
              {/* Connection Info */}
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Jira Site</p>
                    <a
                      href={jira.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      {jira.siteUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Connected As</p>
                    <p className="font-medium">{jira.email}</p>
                  </div>
                  {jira.lastSynced && (
                    <div>
                      <p className="text-sm text-muted-foreground">Last Synced</p>
                      <p className="font-medium">{jira.lastSynced}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Result */}
              {testResult && (
                <Alert variant={testResult.success ? 'success' : 'error'}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Unlink className="mr-2 h-4 w-4" />
                      Disconnect
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleConnect)} className="space-y-4">
              {jira.error && (
                <Alert variant="error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{jira.error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="siteUrl" className="text-sm font-medium">
                  Jira Site URL
                </label>
                <Input
                  id="siteUrl"
                  placeholder="https://your-domain.atlassian.net"
                  {...register('siteUrl')}
                  className={errors.siteUrl ? 'border-destructive' : ''}
                />
                {errors.siteUrl && (
                  <p className="text-sm text-destructive">{errors.siteUrl.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="apiToken" className="text-sm font-medium">
                  API Token
                </label>
                <Input
                  id="apiToken"
                  type="password"
                  placeholder="Enter your Jira API token"
                  {...register('apiToken')}
                  className={errors.apiToken ? 'border-destructive' : ''}
                />
                {errors.apiToken && (
                  <p className="text-sm text-destructive">{errors.apiToken.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  You can create an API token in your{' '}
                  <a
                    href="https://id.atlassian.com/manage-profile/security/api-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Atlassian account settings
                  </a>
                </p>
              </div>

              <Button type="submit" disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Connect to Jira
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* More Integrations Coming Soon */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">More Integrations</CardTitle>
          <CardDescription>
            Additional integrations will be available soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {['GitHub', 'GitLab', 'Slack', 'TestRail', 'Azure DevOps', 'Jenkins'].map(
              (name) => (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4"
                >
                  <div className="h-8 w-8 rounded bg-muted" />
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
