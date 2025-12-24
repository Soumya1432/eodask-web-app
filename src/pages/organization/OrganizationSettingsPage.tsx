import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrganizationContext, OrgRoleGate } from '@/contexts/OrganizationContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { FormInput, FormTextarea, FormSelect } from '@/components/forms';
import { getOrgInitials } from '@/types';
import { organizationsApi } from '@/lib/api';

const updateOrgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.string().optional(),
});

type UpdateOrgFormData = z.infer<typeof updateOrgSchema>;

const industrySizes = [
  { value: '', label: 'Select size' },
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

const industries = [
  { value: '', label: 'Select industry' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Education', label: 'Education' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Services', label: 'Services' },
  { value: 'Other', label: 'Other' },
];

export const OrganizationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { organization, userRole } = useOrganizationContext();
  const {
    updateOrganization,
    updateSettings,
    deleteOrganization,
    isLoading,
    error,
    fetchOrganization,
  } = useOrganizations();

  const [activeTab, setActiveTab] = useState<'general' | 'settings' | 'danger'>('general');
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateOrgFormData>({
    resolver: zodResolver(updateOrgSchema),
    defaultValues: {
      name: organization?.name || '',
      description: organization?.description || '',
      website: organization?.website || '',
      industry: organization?.industry || '',
      size: organization?.size || '',
    },
  });

  if (!organization) {
    return <LoadingSpinner />;
  }

  const isOwner = userRole === 'OWNER';
  const isAdmin = userRole === 'ADMIN' || isOwner;

  const onSubmit = (data: UpdateOrgFormData) => {
    updateOrganization(organization.id, data);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      await organizationsApi.uploadLogo(organization.id, file);
      fetchOrganization(organization.id);
    } catch (err) {
      console.error('Failed to upload logo:', err);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleDelete = () => {
    if (
      confirm(
        'Are you sure you want to delete this organization? This action cannot be undone. All projects and data will be permanently deleted.'
      )
    ) {
      deleteOrganization(organization.id);
      navigate('/organizations');
    }
  };

  const handleSettingsChange = (key: string, value: boolean) => {
    updateSettings(organization.id, { [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Organization Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your organization's profile and settings
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            General
          </button>
          <OrgRoleGate minRole="ADMIN">
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Settings
            </button>
          </OrgRoleGate>
          <OrgRoleGate roles={['OWNER']}>
            <button
              onClick={() => setActiveTab('danger')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'danger'
                  ? 'border-red-500 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Danger Zone
            </button>
          </OrgRoleGate>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {/* Logo Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization Logo
            </label>
            <div className="flex items-center space-x-4">
              {organization.logo ? (
                <img
                  src={organization.logo}
                  alt={organization.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {getOrgInitials(organization.name)}
                </div>
              )}
              <OrgRoleGate minRole="ADMIN">
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={logoUploading}
                    disabled={logoUploading}
                  >
                    {organization.logo ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    JPG, PNG, GIF, or WebP. Max 5MB.
                  </p>
                </div>
              </OrgRoleGate>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              label="Organization Name"
              error={errors.name?.message}
              disabled={!isAdmin}
              {...register('name')}
            />

            <FormTextarea
              label="Description"
              rows={3}
              error={errors.description?.message}
              disabled={!isAdmin}
              {...register('description')}
            />

            <FormInput
              label="Website"
              type="url"
              placeholder="https://example.com"
              error={errors.website?.message}
              disabled={!isAdmin}
              {...register('website')}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Industry"
                options={industries}
                error={errors.industry?.message}
                disabled={!isAdmin}
                {...register('industry')}
              />

              <FormSelect
                label="Team Size"
                options={industrySizes}
                error={errors.size?.message}
                disabled={!isAdmin}
                {...register('size')}
              />
            </div>

            <OrgRoleGate minRole="ADMIN">
              <div className="pt-4">
                <Button type="submit" isLoading={isLoading} disabled={!isDirty || isLoading}>
                  Save Changes
                </Button>
              </div>
            </OrgRoleGate>
          </form>
        </div>
      )}

      {activeTab === 'settings' && isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Member Permissions
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Allow members to invite others
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Members can send invitations to join the organization
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={organization.settings?.allowMemberInvites || false}
                  onChange={(e) => handleSettingsChange('allowMemberInvites', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Require approval to join
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    New members must be approved by an admin before joining
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={organization.settings?.requireApprovalToJoin || false}
                  onChange={(e) => handleSettingsChange('requireApprovalToJoin', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'danger' && isOwner && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-2 border-red-200 dark:border-red-800">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
            Danger Zone
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-300">
                Delete Organization
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Once you delete an organization, there is no going back. All projects, tasks,
                and data will be permanently deleted.
              </p>
              <Button
                variant="danger"
                className="mt-4"
                onClick={handleDelete}
                disabled={organization._count.projects > 0}
              >
                Delete Organization
              </Button>
              {organization._count.projects > 0 && (
                <p className="mt-2 text-xs text-red-500">
                  You must delete all projects before deleting the organization.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSettingsPage;
