import { useCallback, useState } from 'react'

import { FilterName } from '@/features/posts/lib/constants/filter-configs'
import { applyFilterToImage } from '@/features/posts/lib/filterStep/applyFilterToImage'
import { UploadedFile } from '@/features/posts/model/types'
import { setFilterProcessingMetrics } from '@/features/posts/model/upload-performance.runtime'

const DEFAULT_FILTER_QUALITY = 0.8
const DEFAULT_FILTER_MAX_DIMENSION = 1080

type UseFilterProcessingResult = {
  isProcessing: boolean
  process: (
    files: UploadedFile[],
    filtersState: Record<number, FilterName>
  ) => Promise<UploadedFile[]>
}

export const useFilterProcessing = (): UseFilterProcessingResult => {
  const [isProcessing, setIsProcessing] = useState(false)

  const process = useCallback(
    async (
      files: UploadedFile[],
      filtersState: Record<number, FilterName>
    ): Promise<UploadedFile[]> => {
      setIsProcessing(true)

      const processedFiles: UploadedFile[] = []
      const filterStart = performance.now()
      const filterPerFileMs: number[] = []

      try {
        for (let idx = 0; idx < files.length; idx++) {
          const file = files[idx]
          const start = performance.now()
          const filter = filtersState[idx] || 'Normal'

          const sourceBlob = file.previewBlob
            ? file.previewBlob
            : await fetch(file.preview).then(response => response.blob())
          const objectUrl = URL.createObjectURL(sourceBlob)

          try {
            const blob = await applyFilterToImage(objectUrl, filter, {
              maxDimension: DEFAULT_FILTER_MAX_DIMENSION,
              quality: DEFAULT_FILTER_QUALITY,
            })

            const fileMs = Number((performance.now() - start).toFixed(0))

            filterPerFileMs.push(fileMs)
            processedFiles.push({ ...file, blob })
          } finally {
            URL.revokeObjectURL(objectUrl)
          }
        }

        const filterTotalMs = Number((performance.now() - filterStart).toFixed(0))

        setFilterProcessingMetrics({
          filesCount: files.length,
          filterTotalMs,
          filterPerFileMs,
        })

        return processedFiles
      } finally {
        setIsProcessing(false)
      }
    },
    []
  )

  return {
    isProcessing,
    process,
  }
}
