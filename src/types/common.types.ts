// API response wrapper
export interface IApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  statusCode: number;
}

// Pagination
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Paginated response
export interface IPaginatedResponse<T> {
  data: T[];
  pagination: IPagination;
}

// Base entity interface
export interface IBaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Loading state
export interface ILoadingState {
  isLoading: boolean;
  error: string | null;
}

// Route meta
export interface IRouteMeta {
  title: string;
  requiresAuth: boolean;
  permissions?: string[];
  roles?: string[];
}
