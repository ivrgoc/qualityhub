export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateMilestoneDto {
  name: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateMilestoneDto {
  name?: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
}
