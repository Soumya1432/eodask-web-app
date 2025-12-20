import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { FormInput, FormTextarea, FormSelect } from '@/components/forms';
import { getOrgInitials } from '@/types';

const createOrgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
});

type CreateOrgFormData = z.infer<typeof createOrgSchema>;

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

export const CreateOrganizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createOrganization, currentOrganization, isLoading, error } = useOrganizations();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateOrgFormData>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: '',
      description: '',
      industry: '',
      size: '',
    },
  });

  const orgName = watch('name');

  // Track the initial org slug to detect when a new org is created
  const initialOrgSlugRef = useRef(currentOrganization?.slug);
  const hasRedirectedRef = useRef(false);

  // Redirect when organization is created (only when a NEW org is created, not on mount)
  useEffect(() => {
    if (
      currentOrganization?.slug &&
      !hasRedirectedRef.current &&
      currentOrganization.slug !== initialOrgSlugRef.current
    ) {
      hasRedirectedRef.current = true;
      navigate(`/org/${currentOrganization.slug}/dashboard`, { replace: true });
    }
  }, [currentOrganization, navigate]);

  const onSubmit = (data: CreateOrgFormData) => {
    createOrganization({
      name: data.name,
      description: data.description,
      industry: data.industry,
      size: data.size,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create your organization
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Welcome, {user?.name}! Let's set up your workspace.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Preview */}
          <div className="mb-6 flex items-center justify-center">
            <div className="w-20 h-20 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {orgName ? getOrgInitials(orgName) : 'ORG'}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              label="Organization Name"
              placeholder="e.g., Acme Inc."
              error={errors.name?.message}
              {...register('name')}
            />

            <FormTextarea
              label="Description"
              placeholder="What does your organization do?"
              rows={3}
              error={errors.description?.message}
              {...register('description')}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Industry"
                options={industries}
                error={errors.industry?.message}
                {...register('industry')}
              />

              <FormSelect
                label="Team Size"
                options={industrySizes}
                error={errors.size?.message}
                {...register('size')}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Create Organization
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            You can create up to 3 organizations. You can always update these details later.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganizationPage;
