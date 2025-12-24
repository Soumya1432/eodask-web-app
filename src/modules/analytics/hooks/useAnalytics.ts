import { useState, useCallback } from 'react';
import { analyticsService } from '../services';
import type { OrganizationAnalytics, ProjectAnalytics } from '../types';

export const useAnalytics = () => {
  const [organizationAnalytics, setOrganizationAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [projectAnalytics, setProjectAnalytics] = useState<ProjectAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizationAnalytics = useCallback(async (organizationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getOrganizationAnalytics(organizationId);
      setOrganizationAnalytics(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjectAnalytics = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getProjectAnalytics(projectId);
      setProjectAnalytics(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load project analytics';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    organizationAnalytics,
    projectAnalytics,
    loading,
    error,
    fetchOrganizationAnalytics,
    fetchProjectAnalytics,
    clearError,
  };
};
