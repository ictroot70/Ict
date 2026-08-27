type FilterProcessingMetrics = {
  filesCount: number
  filterTotalMs: number
  filterPerFileMs: number[]
}

let latestFilterProcessingMetrics: FilterProcessingMetrics | null = null

export const setFilterProcessingMetrics = (metrics: FilterProcessingMetrics): void => {
  latestFilterProcessingMetrics = metrics
}

export const getFilterProcessingMetrics = (): FilterProcessingMetrics | null => {
  return latestFilterProcessingMetrics
}

export const clearFilterProcessingMetrics = (): void => {
  latestFilterProcessingMetrics = null
}
