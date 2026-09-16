'use client'
import React, { useCallback, useState } from 'react'

import { FilterName, FILTERS } from '@/features/posts/lib/constants/filter-configs'
import { Header } from '@/features/posts/ui/Header/header'
import { Carousel } from '@/shared/composites'
import { Card, Typography } from '@/shared/ui'

import styles from './FilterStep.module.scss'

interface Props {
  onNext: () => Promise<void>
  onPrev: () => void
  isProcessing: boolean
  files: Array<{ preview: string }>
  filtersState: Record<number, FilterName>
  setFiltersState: React.Dispatch<React.SetStateAction<Record<number, FilterName>>>
}

export const FilterStep: React.FC<Props> = ({
  onNext,
  onPrev,
  isProcessing,
  files,
  setFiltersState,
  filtersState,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentFilter = filtersState[currentIndex] || 'Normal'

  const applyFilter = useCallback(
    (filterName: FilterName) => {
      setFiltersState(prev => ({ ...prev, [currentIndex]: filterName }))
    },
    [currentIndex, setFiltersState]
  )

  const handleNext = useCallback(() => {
    void onNext()
  }, [onNext])

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
