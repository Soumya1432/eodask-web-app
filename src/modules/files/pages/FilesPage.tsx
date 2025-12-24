import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useProjects } from '@/modules/projects';
import { useFiles } from '../hooks';
import { useTheme } from '@/hooks';
import { toast } from 'react-hot-toast';

interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  uploadedAt: Date;
}

const FILE_TYPE_ICONS: Record<string, string> = {
  'image': '🖼️',
  'video': '🎬',
  'audio': '🎵',
  'application/pdf': '📕',
  'application/zip': '📦',
  'application/x-rar': '📦',
  'text': '📄',
  'application/json': '📋',
  'application/javascript': '📜',
  'default': '📎',
};

const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return FILE_TYPE_ICONS['image'];
  if (mimeType.startsWith('video/')) return FILE_TYPE_ICONS['video'];
  if (mimeType.startsWith('audio/')) return FILE_TYPE_ICONS['audio'];
  if (mimeType.startsWith('text/')) return FILE_TYPE_ICONS['text'];
  return FILE_TYPE_ICONS[mimeType] || FILE_TYPE_ICONS['default'];
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'size' | 'date' | 'project';

export const FilesPage: React.FC = () => {
  const { organization } = useOrganizationContext();
  const { projects, fetchProjects, tasks, fetchTasks } = useProjects();
  const { attachments, fetchAttachments, uploadAttachment, deleteAttachment, uploads, clearCompleted } = useFiles();
  const { isDark } = useTheme();
  const prevUploadsRef = useRef<typeof uploads>([]);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTaskId, setUploadTaskId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watch for completed uploads, show toast, and auto-clear
  useEffect(() => {
    const prevUploads = prevUploadsRef.current;

    // Check for newly completed uploads
    uploads.forEach(upload => {
      const prevUpload = prevUploads.find(u => u.fileName === upload.fileName);

      if (upload.status === 'completed' && prevUpload?.status !== 'completed') {
        toast.success(`"${upload.fileName}" uploaded successfully!`);
      } else if (upload.status === 'error' && prevUpload?.status !== 'error') {
        toast.error(`Failed to upload "${upload.fileName}": ${upload.error || 'Unknown error'}`);
      }
    });

    prevUploadsRef.current = uploads;

    // Auto-clear completed uploads after 2 seconds
    const completedUploads = uploads.filter(u => u.status === 'completed' || u.status === 'error');
    if (completedUploads.length > 0) {
      const timer = setTimeout(() => {
        clearCompleted();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [uploads, clearCompleted]);

  // Fetch projects on mount
  useEffect(() => {
    if (organization?.id) {
      fetchProjects();
    }
  }, [organization?.id, fetchProjects]);

  // Fetch tasks for first project (if any)
  useEffect(() => {
    if (projects.length > 0) {
      fetchTasks(projects[0].id, {});
    }
  }, [projects, fetchTasks]);

  // Fetch attachments for all tasks
  useEffect(() => {
    tasks.forEach(task => {
      fetchAttachments(task.id);
    });
  }, [tasks, fetchAttachments]);

  // Combine all files with metadata
  const allFiles = useMemo((): FileItem[] => {
    const files: FileItem[] = [];

    // tasks is a flat array
    tasks.forEach(task => {
      const project = projects.find(p => p.id === task.projectId);
      const taskAttachments = attachments[task.id] || [];
      taskAttachments.forEach(attachment => {
        files.push({
          ...attachment,
          taskId: task.id,
          taskTitle: task.title,
          projectId: task.projectId,
          projectName: project?.name || 'Unknown',
          projectColor: project?.color || '#6366f1',
          uploadedAt: new Date(), // Would come from API
        });
      });
    });

    return files;
  }, [projects, tasks, attachments]);

  // Filter files
  const filteredFiles = useMemo(() => {
    let result = [...allFiles];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(file =>
        file.originalName.toLowerCase().includes(query) ||
        file.taskTitle.toLowerCase().includes(query) ||
        file.projectName.toLowerCase().includes(query)
      );
    }

    // Project filter
    if (selectedProject !== 'all') {
      result = result.filter(file => file.projectId === selectedProject);
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter(file => file.mimeType.startsWith(selectedType));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.originalName.localeCompare(b.originalName);
        case 'size':
          return b.size - a.size;
        case 'date':
          return b.uploadedAt.getTime() - a.uploadedAt.getTime();
        case 'project':
          return a.projectName.localeCompare(b.projectName);
        default:
          return 0;
      }
    });

    return result;
  }, [allFiles, searchQuery, selectedProject, selectedType, sortBy]);

  // Get unique file types
  const fileTypes = useMemo(() => {
    const types = new Set<string>();
    allFiles.forEach(file => {
      const mainType = file.mimeType.split('/')[0];
      types.add(mainType);
    });
    return Array.from(types);
  }, [allFiles]);

  // Get all tasks for upload modal
  const allTasks = useMemo(() => {
    return tasks.map(task => {
      const project = projects.find(p => p.id === task.projectId);
      return {
        ...task,
        projectName: project?.name || 'Unknown',
      };
    });
  }, [tasks, projects]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && uploadTaskId) {
      Array.from(files).forEach(file => {
        uploadAttachment(uploadTaskId, file);
      });
      setShowUploadModal(false);
      setUploadTaskId('');
    }
  }, [uploadTaskId, uploadAttachment]);

  const handleDeleteFile = useCallback((file: FileItem) => {
    if (window.confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      deleteAttachment(file.taskId, file.id);
      setSelectedFile(null);
    }
  }, [deleteAttachment]);

  const handleDownload = useCallback((file: FileItem) => {
    // In production, this would use the actual download URL
    window.open(file.url, '_blank');
  }, []);

  // Stats
  const stats = useMemo(() => {
    const totalSize = allFiles.reduce((acc, file) => acc + file.size, 0);
    const imageCount = allFiles.filter(f => f.mimeType.startsWith('image/')).length;
    const docCount = allFiles.filter(f =>
      f.mimeType.startsWith('text/') ||
      f.mimeType.includes('pdf') ||
      f.mimeType.includes('document')
    ).length;

    return {
      total: allFiles.length,
      totalSize: formatFileSize(totalSize),
      images: imageCount,
      documents: docCount,
    };
  }, [allFiles]);

  return (
    <div className={`p-6 min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Files
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Manage and share files across your projects
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
        >
          <span>+</span>
          Upload Files
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-xl p-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="text-2xl mb-1">📁</div>
          <div className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {stats.total}
          </div>
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Files</div>
        </div>

        <div className={`rounded-xl p-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="text-2xl mb-1">💾</div>
          <div className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {stats.totalSize}
          </div>
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Size</div>
        </div>

        <div className={`rounded-xl p-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="text-2xl mb-1">🖼️</div>
          <div className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {stats.images}
          </div>
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Images</div>
        </div>

        <div className={`rounded-xl p-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="text-2xl mb-1">📄</div>
          <div className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {stats.documents}
          </div>
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Documents</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`px-4 py-2.5 rounded-lg border text-sm w-[250px] outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDark
                ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />

          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className={`px-4 py-2.5 rounded-lg border text-sm cursor-pointer outline-none ${
              isDark
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={`px-4 py-2.5 rounded-lg border text-sm cursor-pointer outline-none ${
              isDark
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Types</option>
            {fileTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 items-center">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className={`px-4 py-2.5 rounded-lg border text-sm cursor-pointer outline-none ${
              isDark
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
            <option value="project">Sort by Project</option>
          </select>

          {/* View Toggle */}
          <div className={`flex rounded-lg p-1 border ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-gray-100 border-gray-200'}`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-500 text-white'
                  : isDark ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-500 text-white'
                  : isDark ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Upload Progress - Only show active uploads */}
      {uploads.filter(u => u.status === 'pending' || u.status === 'uploading').length > 0 && (
        <div className={`rounded-xl p-4 mb-5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Uploading...
          </h3>
          {uploads.filter(u => u.status === 'pending' || u.status === 'uploading').map(upload => (
            <div key={upload.fileId} className="mb-2">
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{upload.fileName}</span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{upload.progress}%</span>
              </div>
              <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full transition-all duration-300 bg-indigo-500"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className={`rounded-xl py-16 px-5 text-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="text-5xl mb-4">📂</div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No files found
          </h3>
          <p className={isDark ? 'text-slate-500' : 'text-gray-500'}>
            {searchQuery || selectedProject !== 'all' || selectedType !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload files to get started'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFiles.map(file => (
            <div
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className={`rounded-xl p-4 border cursor-pointer transition-all hover:shadow-lg ${
                isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
            >
              {/* File Preview */}
              <div className={`h-28 rounded-lg flex items-center justify-center mb-3 overflow-hidden ${
                isDark ? 'bg-slate-900' : 'bg-gray-100'
              }`}>
                {file.mimeType.startsWith('image/') ? (
                  <img
                    src={file.url}
                    alt={file.originalName}
                    className="max-w-full max-h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">{getFileIcon(file.mimeType)}</span>
                )}
              </div>

              {/* File Info */}
              <div className={`text-sm font-medium truncate mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {file.originalName}
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  {formatFileSize(file.size)}
                </span>
                <span
                  style={{ backgroundColor: file.projectColor }}
                  className="px-1.5 py-0.5 rounded text-[10px] text-white"
                >
                  {file.projectName.slice(0, 10)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          {/* List Header */}
          <div className={`grid grid-cols-[3fr_1fr_1fr_1fr_100px] gap-4 px-4 py-3 text-xs font-semibold uppercase border-b ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}>
            <span>Name</span>
            <span>Size</span>
            <span>Project</span>
            <span>Date</span>
            <span>Actions</span>
          </div>

          {/* List Items */}
          {filteredFiles.map(file => (
            <div
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className={`grid grid-cols-[3fr_1fr_1fr_1fr_100px] gap-4 px-4 py-3 items-center border-b cursor-pointer transition-colors ${
                isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {file.originalName}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                    {file.taskTitle}
                  </div>
                </div>
              </div>

              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {formatFileSize(file.size)}
              </span>

              <span
                style={{ backgroundColor: file.projectColor }}
                className="px-2 py-1 rounded text-xs text-white w-fit"
              >
                {file.projectName}
              </span>

              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {formatDate(file.uploadedAt)}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                  className={`px-2.5 py-1.5 rounded border text-xs transition-colors ${
                    isDark
                      ? 'border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
                      : 'border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400'
                  }`}
                >
                  ↓
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteFile(file); }}
                  className="px-2.5 py-1.5 rounded border border-red-500/50 text-red-500 text-xs hover:bg-red-500/10 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Detail Modal */}
      {selectedFile && (
        <div
          onClick={() => setSelectedFile(null)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl w-full max-w-xl max-h-[80vh] overflow-auto ${
              isDark ? 'bg-slate-800' : 'bg-white'
            }`}
          >
            {/* Preview */}
            <div className={`h-72 flex items-center justify-center rounded-t-2xl ${
              isDark ? 'bg-slate-900' : 'bg-gray-100'
            }`}>
              {selectedFile.mimeType.startsWith('image/') ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.originalName}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <span className="text-7xl">{getFileIcon(selectedFile.mimeType)}</span>
              )}
            </div>

            {/* File Details */}
            <div className="p-6">
              <h2 className={`text-lg font-semibold mb-4 break-words ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedFile.originalName}
              </h2>

              <div className="grid gap-3 mb-5">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Size</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatFileSize(selectedFile.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Type</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{selectedFile.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Project</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{selectedFile.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Task</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{selectedFile.taskTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Uploaded</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatDate(selectedFile.uploadedAt)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="flex-1 py-3 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDeleteFile(selectedFile)}
                  className="px-5 py-3 rounded-lg border border-red-500 text-red-500 font-medium hover:bg-red-500/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          onClick={() => setShowUploadModal(false)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl w-full max-w-md p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
          >
            <h2 className={`text-lg font-semibold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Upload Files
            </h2>

            {/* Select Task */}
            <div className="mb-5">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Select Task
              </label>
              <select
                value={uploadTaskId}
                onChange={(e) => setUploadTaskId(e.target.value)}
                className={`w-full px-3 py-3 rounded-lg border text-sm cursor-pointer outline-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Choose a task...</option>
                {allTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.projectName} - {task.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Drop Zone */}
            <div
              onClick={() => uploadTaskId && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl py-10 px-5 text-center mb-5 transition-all ${
                uploadTaskId ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              } ${isDark ? 'border-slate-600' : 'border-gray-300'}`}
            >
              <div className="text-5xl mb-3">📤</div>
              <p className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Click to upload files
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                or drag and drop files here
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowUploadModal(false)}
                className={`px-5 py-2.5 rounded-lg border text-sm transition-colors ${
                  isDark
                    ? 'border-slate-600 text-white hover:bg-slate-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
