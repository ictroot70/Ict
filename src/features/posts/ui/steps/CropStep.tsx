'use client'
import React, { useRef, useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { Cropper, CropperRef, ImageRestriction } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import styles from './CropStep.module.scss'
import { UploadedFile } from '../../model/types'
import { ImageOutline, Button, Typography, Expand, PlusCircle, Separator } from '@/shared/ui'
import { fileToBase64 } from '@/features/posts/utils/fileToBase64'
import { Header } from '@/features/posts/ui/Header/header'
import { Dropdown } from '@/features/posts/ui/dropdown/Dropdown'
import { MiniCarousel } from '@/features/posts/ui/miniCarusel/MiniCarousel'

interface Props {
  onNext: () => void
  onPrev: () => void
  files: UploadedFile[]
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  getInputProps: (props?: any) => any
  openDialog: () => void
}

const aspectRatios = [
  { label: 'Original', value: 0, icon: <ImageOutline /> },
  {
    label: '1:1',
    value: 1 / 1,
    icon: <div className={clsx(styles.aspectIcon, styles.oneToOne)} />,
  },
  {
    label: '4:5',
    value: 4 / 5,
    icon: <div className={clsx(styles.aspectIcon, styles.fourToFive)} />,
  },
  {
    label: '16:9',
    value: 16 / 9,
    icon: <div className={clsx(styles.aspectIcon, styles.sixteenToNine)} />,
  },
]

export const CropStep: React.FC<Props> = ({
  onNext,
  onPrev,
  files,
  setFiles,
  getInputProps,
  openDialog,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [aspect, setAspect] = useState<number | undefined>(undefined)
  const [isOpen, setIsOpen] = useState(false)
  const [isOpen1, setIsOpen1] = useState(false)
  const shouldShowAddButton = files.length < 10
  const currentFile = files[currentIndex]
  const safePreview = currentFile
  const cropperRef = useRef<CropperRef>(null)

  useEffect(() => {
    if (currentFile?.aspect) {
      setAspect(currentFile.aspect)
    } else {
      setAspect(undefined)
    }
  }, [currentFile])
  const saveCrop = () => {
    if (cropperRef.current) {
      if (!aspect) {
        return
      }

      const canvas = cropperRef.current.getCanvas()
      if (canvas) {
        const croppedImage = canvas.toDataURL('image/jpeg')
        setFiles(prev =>
          prev.map((f, idx) => (idx === currentIndex ? { ...f, preview: croppedImage } : f))
        )
      }
    }
  }

  const handleThumbClick = (idx: number) => {
    if (aspect && currentFile) {
      saveCrop()
    }
    setCurrentIndex(idx)
    setAspect(undefined)
    setIsOpen(false)
    setIsOpen1(false)
  }

  const handleNext = () => {
    if (aspect && currentFile) saveCrop()
    setIsOpen(false)
    onNext()
  }

  const handleAspectChange = async (aspect: number) => {
    if (!currentFile) return
    let base64ToRestore: string | undefined
    if (!currentFile.original || !currentFile.original.startsWith('data:image')) {
      try {
        base64ToRestore = await fileToBase64(currentFile.file)
      } catch (error) {
        console.error('❌ Error converting file to base64:', error)
        return
      }
    } else {
      base64ToRestore = currentFile.original
    }
    if (!base64ToRestore) return
    setFiles(prev =>
      prev.map((f, idx) =>
        idx === currentIndex
          ? { ...f, preview: base64ToRestore, crop: undefined, zoom: 1, aspect }
          : f
      )
    )
    cropperRef.current?.reset()
    setAspect(aspect)
  }

  const handleDelete = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
    if (currentIndex === idx) {
      setCurrentIndex(0)
    } else if (currentIndex > idx) {
      setCurrentIndex(prev => prev - 1)
    }
    if (files.length === 1) {
      setIsOpen(false)
    }
  }

  const shouldDisableNext =
    files.length === 0 || !currentFile /* || !isValidBase64(getSafePreview(currentFile))*/
  if (files.length === 0) {
    return (
      <div className={styles.wrapper}>
        <Header
          onPrev={onPrev}
          onNext={handleNext}
          title="Cropping"
          nextStepTitle="Next"
          disabledNext={shouldDisableNext}
        />

        <div className={styles.emptyState}>
          <div className={styles.emptyStateText}>
            <Typography variant="h1">No images selected</Typography>
          </div>
          <div className={styles.emptyStateText}>
            <Typography variant="regular_14">Select a photo to continue cropping.</Typography>
            <Button
              variant={'outlined'}
              className={styles.addPhotoBtn}
              onClick={() => openDialog()}
            >
              Add Photo
            </Button>
            <input
              {...getInputProps({
                onClick: (event: React.MouseEvent<HTMLInputElement>) => {
                  event.currentTarget.value = ''
                },
              })}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <Header
        onPrev={onPrev}
        onNext={handleNext}
        title="Cropping"
        nextStepTitle="Next"
        disabledNext={shouldDisableNext}
      />

      <div className={styles.cropContainer}>
        <Cropper
          key={currentIndex}
          src={currentFile.preview}
          className={styles.cropper}
          ref={cropperRef}
          imageRestriction={ImageRestriction.stencil}
          stencilProps={
            aspect
              ? { aspectRatio: aspect }
              : {
                  movable: false,
                  resizable: false,
                  handlers: false,
                  lines: false,
                  preview: false,
                  size: 'fullscreen',
                  overlayClassName: styles.noOverlay,
                }
          }
        />
      </div>
      <div className={styles.actions}>
        <Dropdown
          className={styles.dropdown}
          open={isOpen1}
          onOpenChange={open => {
            if (open) setIsOpen(false)
            setIsOpen1(open)
          }}
          trigger={
            <button className={clsx(styles.iconBtn, styles.left, isOpen1 && `${styles.active}`)}>
              <Expand size={24} />
            </button>
          }
        >
          <div className={styles.aspectRatios}>
            {aspectRatios.map(ar => (
              <button
                key={ar.label}
                className={`${styles.aspectBtn} ${
                  aspect === ar.value || (ar.value === 0 && aspect === undefined)
                    ? styles.active
                    : ''
                }`}
                onClick={() => handleAspectChange(ar.value)}
              >
                {ar.label}
                {ar.icon}
              </button>
            ))}
          </div>
        </Dropdown>
        <Dropdown
          className={styles.dropdown}
          open={isOpen}
          onOpenChange={open => {
            if (open) setIsOpen1(false)
            setIsOpen(open)
          }}
          trigger={
            <button
              type="button"
              className={clsx(styles.iconBtn, styles.right, isOpen && `${styles.active}`)}
            >
              <ImageOutline className={clsx(isOpen && styles.iconActive)} />
              {!isOpen && files.length > 0 && (
                <span className={styles.countBadge}>{files.length}</span>
              )}
            </button>
          }
        >
          <div className={styles.thumbs}>
            <MiniCarousel>
              {files.map((f, idx) => (
                <div
                  key={f.file.lastModified || idx}
                  className={`${styles.thumb} ${idx === currentIndex ? styles.active : ''}`}
                  onClick={() => handleThumbClick(idx)}
                >
                  <img
                    src={f.preview}
                    alt={`thumb-${idx}`}
                    onError={e => {
                      console.error(`❌ Thumbnail load error for index ${idx}`)
                    }}
                  />
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={e => {
                      e.stopPropagation()
                      handleDelete(idx)
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </MiniCarousel>
            <>
              {shouldShowAddButton && (
                <button
                  onClick={() => {
                    openDialog()
                    setIsOpen(false)
                  }}
                  className={styles.addThumbBtn}
                >
                  <PlusCircle className={styles.addThumb} />
                </button>
              )}
              {isOpen && files.length > 0 && (
                <span className={styles.countBadge}>{files.length}</span>
              )}
            </>
          </div>
        </Dropdown>
        <input
          {...getInputProps({
            onClick: (event: React.MouseEvent<HTMLInputElement>) => {
              event.currentTarget.value = ''
            },
          })}
        />
      </div>
    </div>
  )
}
