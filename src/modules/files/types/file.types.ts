export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface FileState {
  // Task attachments
  attachments: Record<string, FileUpload[]>; // taskId -> attachments
  attachmentsLoading: Record<string, boolean>;
  attachmentsError: Record<string, string | null>;

  // Upload progress
  uploads: UploadProgress[];

  // Current upload
  uploading: boolean;
  uploadError: string | null;

  // Delete
  deleting: boolean;
  deleteError: string | null;
}

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}
