export type Id = string;

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
