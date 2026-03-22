export const DEFAULT_PAYMENTS_PAGE_NUMBER = 1

export const DEFAULT_PAYMENTS_PAGE_SIZE = 8

export const PAYMENTS_PAGE_SIZE_OPTIONS = Array.from(
  { length: 3 },
  (_, index) => DEFAULT_PAYMENTS_PAGE_SIZE * (index + 1)
)
