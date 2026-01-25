export interface Attachment {
  id: string;
  entityType: string;
  entityId: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
}

export interface CreateAttachmentDto {
  entityType: string;
  entityId: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
}
