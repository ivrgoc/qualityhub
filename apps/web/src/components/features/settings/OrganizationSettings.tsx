import { type FC, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  Mail,
  Trash2,
  Loader2,
  Plus,
  Crown,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';

const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
});

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['viewer', 'tester', 'lead', 'admin']),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;
type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'tester' | 'lead' | 'admin' | 'owner';
  avatarUrl?: string;
  joinedAt: string;
}

export interface OrganizationSettingsProps {
  organization: {
    id: string;
    name: string;
    plan: string;
    memberCount: number;
  };
  members: OrganizationMember[];
  currentUserId: string;
  onUpdateOrganization: (data: OrganizationFormData) => Promise<void>;
  onInviteMember: (data: InviteMemberFormData) => Promise<void>;
  onUpdateMemberRole: (memberId: string, role: string) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  isUpdating?: boolean;
  isInviting?: boolean;
  className?: string;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner: { label: 'Owner', color: 'bg-purple-100 text-purple-700' },
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700' },
  lead: { label: 'Lead', color: 'bg-blue-100 text-blue-700' },
  tester: { label: 'Tester', color: 'bg-green-100 text-green-700' },
  viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-700' },
};

/**
 * Organization settings component with name and member management.
 */
export const OrganizationSettings: FC<OrganizationSettingsProps> = ({
  organization,
  members,
  currentUserId,
  onUpdateOrganization,
  onInviteMember,
  onUpdateMemberRole,
  onRemoveMember,
  isUpdating,
  isInviting,
  className,
}) => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization.name,
    },
  });

  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    setValue: setInviteValue,
    formState: { errors: inviteErrors },
    reset: resetInviteForm,
    watch: watchInvite,
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      role: 'tester',
    },
  });

  const handleInvite = useCallback(
    async (data: InviteMemberFormData) => {
      await onInviteMember(data);
      resetInviteForm();
      setShowInviteDialog(false);
    },
    [onInviteMember, resetInviteForm]
  );

  const handleRemoveMember = useCallback(async () => {
    if (memberToRemove) {
      await onRemoveMember(memberToRemove.id);
      setMemberToRemove(null);
    }
  }, [memberToRemove, onRemoveMember]);

  return (
    <div className={className}>
      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Manage your organization's name and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onUpdateOrganization)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="orgName" className="text-sm font-medium">
                Organization Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="orgName"
                  {...register('name')}
                  className={`pl-9 ${errors.name ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="font-medium">{organization.plan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="font-medium">{organization.memberCount}</p>
              </div>
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your organization's team members and their roles
              </CardDescription>
            </div>
            <Button onClick={() => setShowInviteDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => {
              const initials = member.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
              const roleInfo = ROLE_LABELS[member.role];
              const isCurrentUser = member.id === currentUserId;
              const isOwner = member.role === 'owner';

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name}</span>
                        {isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isOwner && !isCurrentUser ? (
                      <>
                        <Select
                          defaultValue={member.role}
                          onValueChange={(value) => onUpdateMemberRole(member.id, value)}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="tester">Tester</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setMemberToRemove(member)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <Badge className={roleInfo?.color}>{roleInfo?.label}</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteSubmit(handleInvite)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="inviteEmail" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="colleague@example.com"
                  {...registerInvite('email')}
                  className={`pl-9 ${inviteErrors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {inviteErrors.email && (
                <p className="text-sm text-destructive">{inviteErrors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="inviteRole" className="text-sm font-medium">
                Role
              </label>
              <Select
                value={watchInvite('role')}
                onValueChange={(value) =>
                  setInviteValue('role', value as InviteMemberFormData['role'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                  <SelectItem value="tester">Tester - Execute tests</SelectItem>
                  <SelectItem value="lead">Lead - Manage tests and runs</SelectItem>
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isInviting}>
                {isInviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${memberToRemove?.name} from the organization? They will lose access to all projects.`}
        confirmLabel="Remove"
        onConfirm={handleRemoveMember}
        variant="destructive"
      />
    </div>
  );
};
