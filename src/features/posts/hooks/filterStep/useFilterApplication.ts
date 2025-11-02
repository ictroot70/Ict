import { FILTER_CONFIGS, FilterName } from '@/features/posts/lib/constants/filter-configs'

export const useFilterApplication = () => {
  const applyCanvasFilter = (canvas: HTMLCanvasElement, filter: FilterName) => {
    const ctx = canvas.getContext('2d')!
    ctx.filter = FILTER_CONFIGS[filter]
  }

  return { applyCanvasFilter }
}
