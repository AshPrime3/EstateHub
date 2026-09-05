export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function getPaginationOffset(params: PaginationParams): { skip: number; take: number } {
  return {
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
  };
}

export function buildPaginationResult(params: PaginationParams, total: number): PaginationResult {
  return {
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.ceil(total / params.pageSize),
  };
}
