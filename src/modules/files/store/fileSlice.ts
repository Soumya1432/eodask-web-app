import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FileUpload, FileState } from '../types';

const initialState: FileState = {
  attachments: {},
  attachmentsLoading: {},
  attachmentsError: {},

  uploads: [],

  uploading: false,
  uploadError: null,

  deleting: false,
  deleteError: null,
};

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    // Fetch attachments
    fetchAttachmentsRequest: (state, action: PayloadAction<string>) => {
      state.attachmentsLoading[action.payload] = true;
      state.attachmentsError[action.payload] = null;
    },
    fetchAttachmentsSuccess: (state, action: PayloadAction<{ taskId: string; attachments: FileUpload[] }>) => {
      state.attachmentsLoading[action.payload.taskId] = false;
      state.attachments[action.payload.taskId] = action.payload.attachments;
    },
    fetchAttachmentsFailure: (state, action: PayloadAction<{ taskId: string; error: string }>) => {
      state.attachmentsLoading[action.payload.taskId] = false;
      state.attachmentsError[action.payload.taskId] = action.payload.error;
    },

    // Upload attachment
    uploadAttachmentRequest: (state, action: PayloadAction<{ taskId: string; file: File }>) => {
      state.uploading = true;
      state.uploadError = null;
      // Add to uploads list
      state.uploads.push({
        fileId: `temp-${Date.now()}`,
        fileName: action.payload.file.name,
        progress: 0,
        status: 'pending',
      });
    },
    uploadAttachmentProgress: (state, action: PayloadAction<{ fileName: string; progress: number }>) => {
      const upload = state.uploads.find(u => u.fileName === action.payload.fileName);
      if (upload) {
        upload.progress = action.payload.progress;
        upload.status = 'uploading';
      }
    },
    uploadAttachmentSuccess: (state, action: PayloadAction<{ taskId: string; attachment: FileUpload }>) => {
      state.uploading = false;
      // Add to attachments
      if (!state.attachments[action.payload.taskId]) {
        state.attachments[action.payload.taskId] = [];
      }
      state.attachments[action.payload.taskId].unshift(action.payload.attachment);
      // Update upload status
      const upload = state.uploads.find(u => u.fileName === action.payload.attachment.originalName);
      if (upload) {
        upload.fileId = action.payload.attachment.id;
        upload.progress = 100;
        upload.status = 'completed';
      }
    },
    uploadAttachmentFailure: (state, action: PayloadAction<{ fileName: string; error: string }>) => {
      state.uploading = false;
      state.uploadError = action.payload.error;
      // Update upload status
      const upload = state.uploads.find(u => u.fileName === action.payload.fileName);
      if (upload) {
        upload.status = 'error';
        upload.error = action.payload.error;
      }
    },

    // Delete attachment
    deleteAttachmentRequest: (state, _action: PayloadAction<{ taskId: string; attachmentId: string }>) => {
      state.deleting = true;
      state.deleteError = null;
    },
    deleteAttachmentSuccess: (state, action: PayloadAction<{ taskId: string; attachmentId: string }>) => {
      state.deleting = false;
      if (state.attachments[action.payload.taskId]) {
        state.attachments[action.payload.taskId] = state.attachments[action.payload.taskId].filter(
          a => a.id !== action.payload.attachmentId
        );
      }
    },
    deleteAttachmentFailure: (state, action: PayloadAction<string>) => {
      state.deleting = false;
      state.deleteError = action.payload;
    },

    // Upload avatar
    uploadAvatarRequest: (state, _action: PayloadAction<File>) => {
      state.uploading = true;
      state.uploadError = null;
    },
    uploadAvatarSuccess: (state, _action: PayloadAction<string>) => {
      state.uploading = false;
    },
    uploadAvatarFailure: (state, action: PayloadAction<string>) => {
      state.uploading = false;
      state.uploadError = action.payload;
    },

    // Clear completed uploads
    clearCompletedUploads: (state) => {
      state.uploads = state.uploads.filter(u => u.status !== 'completed' && u.status !== 'error');
    },

    // Clear upload from list
    clearUpload: (state, action: PayloadAction<string>) => {
      state.uploads = state.uploads.filter(u => u.fileId !== action.payload);
    },

    // Clear errors
    clearUploadError: (state) => {
      state.uploadError = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
  },
});

export const {
  fetchAttachmentsRequest,
  fetchAttachmentsSuccess,
  fetchAttachmentsFailure,
  uploadAttachmentRequest,
  uploadAttachmentProgress,
  uploadAttachmentSuccess,
  uploadAttachmentFailure,
  deleteAttachmentRequest,
  deleteAttachmentSuccess,
  deleteAttachmentFailure,
  uploadAvatarRequest,
  uploadAvatarSuccess,
  uploadAvatarFailure,
  clearCompletedUploads,
  clearUpload,
  clearUploadError,
  clearDeleteError,
} = fileSlice.actions;

export default fileSlice.reducer;
