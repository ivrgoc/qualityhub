import { type FC, useState } from 'react';
import { UserPlus, MoreHorizontal, Mail, Shield, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Avatar,
  Badge,
  Skeleton,
  Alert,
  AlertDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ConfirmDialog,
} from '@/components/ui';
import { cn } from '@/utils/cn';
import { UserRole } from '@/types';
import {
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useUpdateProjectMemberMutation,
  useRemoveProjectMemberMutation,
  type ProjectMember,
} from '@/store/api/projectsApi';

export interface ProjectMembersProps {
  /** Project ID */
  projectId: string;
  /** Current user ID (to prevent self-removal) */
  currentUserId?: string;
  /** Whether the current user can manage members */
  canManage?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Returns the role badge variant.
 */
function getRoleVariant(role: UserRole): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case UserRole.ADMIN:
      return 'default';
    case UserRole.LEAD:
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * Returns the role label.
 */
function getRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Admin';
    case UserRole.LEAD:
      return 'Lead';
    case UserRole.TESTER:
      return 'Tester';
    case UserRole.VIEWER:
      return 'Viewer';
    default:
      return role;
  }
}

/**
 * Loading skeleton for members list.
 */
const MembersSkeleton: FC = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    ))}
  </div>
);

/**
 * Project members management component.
 */
export const ProjectMembers: FC<ProjectMembersProps> = ({
  projectId,
  currentUserId,
  canManage = false,
  className,
}) => {
  const { data: members, isLoading, error } = useGetProjectMembersQuery(projectId);
  const [addMember, { isLoading: isAdding }] = useAddProjectMemberMutation();
  const [updateMember] = useUpdateProjectMemberMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveProjectMemberMutation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>(UserRole.TESTER);
  const [emailError, setEmailError] = useState<string>();
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);

  /**
   * Handles adding a new member.
   */
  const handleAddMember = async (): Promise<void> => {
    if (!newMemberEmail.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMemberEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      await addMember({
        projectId,
        email: newMemberEmail.trim(),
        role: newMemberRole,
      }).unwrap();

      setNewMemberEmail('');
      setNewMemberRole(UserRole.TESTER);
      setShowAddForm(false);
      setEmailError(undefined);
    } catch {
      setEmailError('Failed to add member. Please try again.');
    }
  };

  /**
   * Handles updating a member's role.
   */
  const handleUpdateRole = async (member: ProjectMember, role: UserRole): Promise<void> => {
    try {
      await updateMember({
        projectId,
        memberId: member.id,
        role,
      }).unwrap();
    } catch {
      // Error is handled by RTK Query
    }
  };

  /**
   * Handles removing a member.
   */
  const handleRemoveMember = async (): Promise<void> => {
    if (!memberToRemove) return;

    try {
      await removeMember({
        projectId,
        memberId: memberToRemove.id,
      }).unwrap();
      setMemberToRemove(null);
    } catch {
      // Error is handled by RTK Query
    }
  };

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Team Members</CardTitle>
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add member
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Add Member Form */}
        {showAddForm && canManage && (
          <div className="mb-4 rounded-lg border bg-muted/30 p-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Email address"
                  value={newMemberEmail}
                  onChange={(e) => {
                    setNewMemberEmail(e.target.value);
                    if (emailError) setEmailError(undefined);
                  }}
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={emailError}
                  disabled={isAdding}
                  className="flex-1"
                />
                <Select
                  value={newMemberRole}
                  onValueChange={(value) => setNewMemberRole(value as UserRole)}
                  disabled={isAdding}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.VIEWER}>Viewer</SelectItem>
                    <SelectItem value={UserRole.TESTER}>Tester</SelectItem>
                    <SelectItem value={UserRole.LEAD}>Lead</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewMemberEmail('');
                    setEmailError(undefined);
                  }}
                  disabled={isAdding}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddMember} disabled={isAdding}>
                  {isAdding ? 'Adding...' : 'Add'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="error" icon={<AlertCircle className="h-4 w-4" />} className="mb-4">
            <AlertDescription>Failed to load team members.</AlertDescription>
          </Alert>
        )}

        {/* Members List */}
        {isLoading ? (
          <MembersSkeleton />
        ) : members && members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Avatar name={member.user.name} size="default" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {member.user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
                <Badge variant={getRoleVariant(member.role)}>
                  <Shield className="mr-1 h-3 w-3" />
                  {getRoleLabel(member.role)}
                </Badge>
                {canManage && member.userId !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(member, UserRole.VIEWER)}
                        disabled={member.role === UserRole.VIEWER}
                      >
                        Set as Viewer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(member, UserRole.TESTER)}
                        disabled={member.role === UserRole.TESTER}
                      >
                        Set as Tester
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(member, UserRole.LEAD)}
                        disabled={member.role === UserRole.LEAD}
                      >
                        Set as Lead
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(member, UserRole.ADMIN)}
                        disabled={member.role === UserRole.ADMIN}
                      >
                        Set as Admin
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setMemberToRemove(member)}
                      >
                        Remove from project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No team members yet
          </p>
        )}

        {/* Remove Member Confirmation */}
        <ConfirmDialog
          open={!!memberToRemove}
          onOpenChange={(open) => !open && setMemberToRemove(null)}
          title="Remove team member"
          description={`Are you sure you want to remove ${memberToRemove?.user.name} from this project? They will lose access to all project resources.`}
          confirmText="Remove"
          variant="destructive"
          onConfirm={handleRemoveMember}
          isLoading={isRemoving}
        />
      </CardContent>
    </Card>
  );
};
