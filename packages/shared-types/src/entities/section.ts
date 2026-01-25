export interface Section {
  id: string;
  suiteId: string;
  name: string;
  description?: string;
  parentId?: string;
  position: number;
  createdAt: string;
}

export interface CreateSectionDto {
  name: string;
  description?: string;
  parentId?: string;
  position?: number;
}

export interface UpdateSectionDto {
  name?: string;
  description?: string;
  parentId?: string;
  position?: number;
}
