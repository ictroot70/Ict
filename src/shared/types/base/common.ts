export interface AvatarViewDto {
  url: string
  width: number
  height: number
  fileSize: number
  createdAt?: string
}

export interface InfinityPaginationViewModel {
  pageSize: number
  totalCount: number
  notReadCount?: number
}

export interface CursorPagination {
  totalCount: number
  pagesCount: number
  page: number
  pageSize: number
  prevCursor: number
  nextCursor: number | null
}
