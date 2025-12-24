import { call, put, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  fetchAttachmentsRequest,
  fetchAttachmentsSuccess,
  fetchAttachmentsFailure,
  uploadAttachmentRequest,
  uploadAttachmentSuccess,
  uploadAttachmentFailure,
  deleteAttachmentRequest,
  deleteAttachmentSuccess,
  deleteAttachmentFailure,
  uploadAvatarRequest,
  uploadAvatarSuccess,
  uploadAvatarFailure,
} from './fileSlice';
import { fileService } from '../services';
import { authService } from '@/modules/auth/services';
import type { FileUpload } from '../types';

// Fetch attachments
function* handleFetchAttachments(action: PayloadAction<string>) {
  try {
    const attachments: FileUpload[] = yield call(fileService.getTaskAttachments, action.payload);
    yield put(fetchAttachmentsSuccess({ taskId: action.payload, attachments }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch attachments';
    yield put(fetchAttachmentsFailure({ taskId: action.payload, error: message }));
  }
}

// Upload attachment
function* handleUploadAttachment(action: PayloadAction<{ taskId: string; file: File }>) {
  try {
    // Validate file first
    const validation = fileService.validateFile(action.payload.file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const attachment: FileUpload = yield call(
      fileService.uploadTaskAttachment,
      action.payload.taskId,
      action.payload.file
    );
    yield put(uploadAttachmentSuccess({ taskId: action.payload.taskId, attachment }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload file';
    yield put(uploadAttachmentFailure({ fileName: action.payload.file.name, error: message }));
  }
}

// Delete attachment
function* handleDeleteAttachment(action: PayloadAction<{ taskId: string; attachmentId: string }>) {
  try {
    yield call(fileService.deleteAttachment, action.payload.attachmentId);
    yield put(deleteAttachmentSuccess(action.payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete attachment';
    yield put(deleteAttachmentFailure(message));
  }
}

// Upload avatar
function* handleUploadAvatar(action: PayloadAction<File>) {
  try {
    // Validate file first
    const validation = fileService.validateFile(action.payload, {
      maxSize: 5 * 1024 * 1024, // 5MB for avatars
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    });
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const avatarUrl: string = yield call(fileService.uploadAvatar, action.payload);

    // Update user profile with new avatar
    yield call(authService.updateProfile, { avatar: avatarUrl });

    yield put(uploadAvatarSuccess(avatarUrl));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload avatar';
    yield put(uploadAvatarFailure(message));
  }
}

// Root file saga
export function* fileSaga() {
  yield takeEvery(fetchAttachmentsRequest.type, handleFetchAttachments);
  yield takeEvery(uploadAttachmentRequest.type, handleUploadAttachment);
  yield takeEvery(deleteAttachmentRequest.type, handleDeleteAttachment);
  yield takeEvery(uploadAvatarRequest.type, handleUploadAvatar);
}
