import { type FC } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectMembers } from '@/components/features/projects';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';

/**
 * Project team page for managing team members.
 */
export const ProjectTeamPage: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const currentUser = useAppSelector(selectUser);

  if (!projectId) {
    return null;
  }

  return (
    <div className="max-w-2xl">
      <ProjectMembers
        projectId={projectId}
        currentUserId={currentUser?.id}
        canManage={true} // TODO: Check actual user permissions
      />
    </div>
  );
};
