import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks';
import {
  fetchAttachmentsRequest,
  uploadAttachmentRequest,
  deleteAttachmentRequest,
  uploadAvatarRequest,
  clearCompletedUploads,
  clearUpload,
  clearUploadError,
  clearDeleteError,
} from '../store/fileSlice';

export const useFiles = () => {
  const dispatch = useAppDispatch();
  const {
    attachments,
    attachmentsLoading,
    attachmentsError,
    uploads,
    uploading,
    uploadError,
    deleting,
    deleteError,
  } = useAppSelector((state) => state.files);

  // Fetch attachments for a task
  const fetchAttachments = useCallback((taskId: string) => {
    dispatch(fetchAttachmentsRequest(taskId));
  }, [dispatch]);

  // Upload attachment to a task
  const uploadAttachment = useCallback((taskId: string, file: File) => {
    dispatch(uploadAttachmentRequest({ taskId, file }));
  }, [dispatch]);

  // Delete attachment
  const deleteAttachment = useCallback((taskId: string, attachmentId: string) => {
    dispatch(deleteAttachmentRequest({ taskId, attachmentId }));
  }, [dispatch]);

  // Upload avatar
  const uploadAvatar = useCallback((file: File) => {
    dispatch(uploadAvatarRequest(file));
  }, [dispatch]);

  // Clear completed uploads from the list
  const clearCompleted = useCallback(() => {
    dispatch(clearCompletedUploads());
  }, [dispatch]);

  // Remove a specific upload from the list
  const removeUpload = useCallback((fileId: string) => {
    dispatch(clearUpload(fileId));
  }, [dispatch]);

  // Clear upload error
  const clearUploadErr = useCallback(() => {
    dispatch(clearUploadError());
  }, [dispatch]);

  // Clear delete error
  const clearDeleteErr = useCallback(() => {
    dispatch(clearDeleteError());
  }, [dispatch]);

  // Get attachments for a specific task
  const getTaskAttachments = useCallback((taskId: string) => {
    return attachments[taskId] || [];
  }, [attachments]);

  // Check if attachments are loading for a task
  const isLoadingAttachments = useCallback((taskId: string) => {
    return attachmentsLoading[taskId] || false;
  }, [attachmentsLoading]);

  // Get attachment error for a task
  const getAttachmentError = useCallback((taskId: string) => {
    return attachmentsError[taskId] || null;
  }, [attachmentsError]);

  return {
    // State
    attachments,
    attachmentsLoading,
    attachmentsError,
    uploads,
    uploading,
    uploadError,
    deleting,
    deleteError,

    // Actions
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
    uploadAvatar,
    clearCompleted,
    removeUpload,
    clearUploadError: clearUploadErr,
    clearDeleteError: clearDeleteErr,

    // Helpers
    getTaskAttachments,
    isLoadingAttachments,
    getAttachmentError,
  };
};
