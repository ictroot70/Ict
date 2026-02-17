'use client'
import React, { useCallback, useState } from 'react'

import { FilterName, FILTERS } from '@/features/posts/lib/constants/filter-configs'
import { applyFilterToImage } from '@/features/posts/lib/filterStep/applyFilterToImage'
import { UploadedFile } from '@/features/posts/model/types'
import { Header } from '@/features/posts/ui/Header/header'
import { Carousel, ToastAlert } from '@/shared/composites'
import { Card, Typography } from '@/shared/ui'
import { toast } from 'react-toastify/unstyled'

import styles from './FilterStep.module.scss'

interface Props {
  onNext: (processedFiles: UploadedFile[]) => void
  onPrev: () => void
  files: UploadedFile[]
  filtersState: Record<number, FilterName>
  setFiltersState: React.Dispatch<React.SetStateAction<Record<number, FilterName>>>
}

export const FilterStep: React.FC<Props> = ({
  onNext,
  onPrev,
  files,
  setFiltersState,
  filtersState,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const currentFilter = filtersState[currentIndex] || 'Normal'

  const applyFilter = useCallback(
    (filterName: FilterName) => {
      setFiltersState(prev => ({ ...prev, [currentIndex]: filterName }))
    },
    [currentIndex, setFiltersState]
  )

  const handleNext = useCallback(async () => {
    try {
      setIsProcessing(true)

      const processedFiles = await Promise.all(
        files.map(async (file, idx) => {
          const filter = filtersState[idx] || 'Normal'
          const blob = await applyFilterToImage(file.preview, filter, {
            maxDimension: 1080, // Instagram-стандарт: уменьшает размер файла в ~3x vs 1920
            quality: 0.8,
          })

          return { ...file, blob }
        })
      )

      onNext(processedFiles)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error processing images'

      toast(<ToastAlert type={'error'} message={`❌ ${msg}`} />)
    } finally {
      setIsProcessing(false)
    }
  }, [files, filtersState, onNext])

  return (
    <div className={styles.wrapper}>
      <Header
        onPrev={onPrev}
        onNext={handleNext}
        title={'Filters'}
        nextStepTitle={isProcessing ? 'Processing...' : 'Next'}
        disabledNext={isProcessing}
      />
      <div className={styles.carouselContainer}>
        <div className={styles.carouselWrapper}>
          <Carousel
            slides={files.map(f => f.preview)}
            filtersState={filtersState}
            onSlideChange={setCurrentIndex}
          />
        </div>

        <div className={styles.filtersRow}>
          {FILTERS.map(f => (
            <Card
              key={f.name}
              className={`${styles.filterItem} ${currentFilter === f.name ? styles.active : ''}`}
              onClick={() => applyFilter(f.name)}
            >
              <img
                src={files[currentIndex].preview}
                alt={f.name}
                className={`${styles.filterThumb} ${f.className ? styles[f.className] : ''}`}
              />
              <Typography>{f.name}</Typography>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
