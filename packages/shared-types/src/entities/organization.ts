export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  createdAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  plan?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  plan?: string;
}
