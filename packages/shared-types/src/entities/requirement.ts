export interface Requirement {
  id: string;
  projectId: string;
  externalId?: string;
  title: string;
  description?: string;
  source?: string;
  status: string;
  createdAt: string;
}

export interface CreateRequirementDto {
  title: string;
  description?: string;
  externalId?: string;
  source?: string;
  status?: string;
}

export interface UpdateRequirementDto {
  title?: string;
  description?: string;
  externalId?: string;
  source?: string;
  status?: string;
}
