import { z } from 'zod';

export const paginationDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
};

export type PaginationDto = z.infer<typeof paginationDto>;
