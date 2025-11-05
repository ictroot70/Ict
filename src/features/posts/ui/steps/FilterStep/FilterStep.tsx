'use client'
import React, { useCallback, useState } from 'react'
import styles from './FilterStep.module.scss'
import { FilterName, FILTERS } from '@/features/posts/lib/constants/filter-configs'
import { Header } from '@/features/posts/ui/Header/header'
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel'
import { PostImageViewModel } from '@/entities/posts/api/posts.types'
import { toast } from 'react-toastify/unstyled'
import { ToastAlert } from '@/shared/composites'
import { UploadedFile } from '@/features/posts/model/types'

interface Props {
  onNext: () => void
  onPrev: () => void
  files: UploadedFile[]
  filtersState: Record<number, FilterName>
  setFiltersState: React.Dispatch<React.SetStateAction<Record<number, FilterName>>>
  handleUpload: (file: File | Blob) => Promise<any>
  setUploadedImage: React.Dispatch<React.SetStateAction<PostImageViewModel[]>>
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>
}

export const FilterStep: React.FC<Props> = ({
  onNext,
  onPrev,
  files,
  setFiltersState,
  filtersState,
  handleUpload,
  setUploadedImage,
  setIsUploading,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentFilter = filtersState[currentIndex] || 'Normal'
  const applyFilter = useCallback(
    (filterName: FilterName) => {
      setFiltersState(prev => ({
        ...prev,
        [currentIndex]: filterName,
      }))
      console.log(`[FilterStep] Applied filter "${filterName}" to image index ${currentIndex}`)
    },
    [currentIndex, setFiltersState]
  )

  const handleNext = useCallback(async () => {
    onNext()

    try {
      setIsUploading(true)
      const uploadPromises = files.map(async (file, idx) => {
        const filter = filtersState[idx] || 'Normal'

        const img = new Image()
        img.src = file.preview
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })

        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!

        switch (filter) {
          case 'Clarendon':
            ctx.filter = 'contrast(1.2) saturate(1.35)'
            break
          case 'Gingham':
            ctx.filter = 'contrast(0.9) brightness(1.1)'
            break
          case 'Moon':
            ctx.filter = 'grayscale(1) contrast(1.1) brightness(1.1)'
            break
          case 'Lark':
            ctx.filter = 'brightness(1.1) saturate(1.2)'
            break
          default:
            ctx.filter = 'none'
        }

        ctx.drawImage(img, 0, 0)

        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg'))
        if (!blob) return null

        return handleUpload(blob)
      })

      const results = await Promise.all(uploadPromises)
      const uploadedAll = results.flatMap(r => r?.images ?? [])
      if (uploadedAll.length > 0) {
        setUploadedImage(uploadedAll as PostImageViewModel[])
      }
    } catch (e: unknown) {
      let msg = 'Error loading files'

      if (typeof e === 'string') msg = e
      else if (e instanceof Error) msg = e.message
      else if (typeof e === 'object' && e && 'data' in e) {
        const data = (e as any).data
        msg = typeof data === 'string' ? data : (data?.message ?? msg)
      }

      toast(<ToastAlert type="error" message={`❌ ${msg}`} />)
    } finally {
      setIsUploading(false)
    }
  }, [files, filtersState, handleUpload, setIsUploading, onNext, setUploadedImage])

  return (
    <div className={styles.wrapper}>
      <Header onPrev={onPrev} onNext={handleNext} title="Filters" nextStepTitle="Next" />
      <div className={styles.carouselContainer}>
        <div className={styles.carouselWrapper}>
          <EmblaCarousel
            photos={files.map(f => f.preview)}
            filtersState={filtersState}
            onSlideChange={setCurrentIndex}
          />
        </div>
        <div className={styles.filtersRow}>
          {FILTERS.map(f => (
            <div
              key={f.name}
              className={`${styles.filterItem} ${currentFilter === f.name ? styles.active : ''}`}
              onClick={() => applyFilter(f.name)}
            >
              <img
                src={files[currentIndex].preview}
                alt={f.name}
                className={`${styles.filterThumb} ${f.className ? styles[f.className] : ''}`}
              />
              <span className={styles.name}>{f.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
