import React from 'react'

import { UploadedFile } from '@/features/posts/model/types'
import { Dropdown } from '@/features/posts/ui/dropdown/Dropdown'
import { MiniCarousel } from '@/features/posts/ui/miniCarusel/MiniCarousel'
import { ImageOutline, PlusCircle } from '@/shared/ui'
import { clsx } from 'clsx'

import styles from '../CropStep.module.scss'

interface ThumbnailsDropdownProps {
  files: UploadedFile[]
  currentIndex: number
  onSelect: (idx: number) => void
  onDelete: (idx: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  shouldShowAddButton: boolean
  openDialog: () => void
}

export const ThumbnailsDropdown: React.FC<ThumbnailsDropdownProps> = ({
  files,
  currentIndex,
  onSelect,
  onDelete,
  open,
  onOpenChange,
  shouldShowAddButton,
  openDialog,
}) => (
  <Dropdown
    className={styles.dropdown}
    open={open}
    onOpenChange={onOpenChange}
    trigger={
      <button type={'button'} className={clsx(styles.iconBtn, styles.right, open && styles.active)}>
        <ImageOutline className={clsx(open && styles.iconActive)} />
        {!open && files.length > 0 && <span className={styles.countBadge}>{files.length}</span>}
      </button>
    }
  >
    <div className={styles.thumbs}>
      <MiniCarousel>
        {files.map((f, idx) => (
          <div
            key={f.file.lastModified || idx}
            className={`${styles.thumb} ${idx === currentIndex ? styles.active : ''}`}
            onClick={() => onSelect(idx)}
          >
            <img
              src={f.preview}
              alt={`thumb-${idx}`}
              onError={() => console.error(`❌ Thumbnail load error for index ${idx}`)}
            />
            <button
              type={'button'}
              className={styles.deleteBtn}
              onClick={e => {
                e.stopPropagation()
                onDelete(idx)
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </MiniCarousel>

      {shouldShowAddButton && (
        <button type={'button'} onClick={() => openDialog()} className={styles.addThumbBtn}>
          <PlusCircle className={styles.addThumb} />
        </button>
      )}
      {open && files.length > 0 && <span className={styles.countBadge}>{files.length}</span>}
    </div>
  </Dropdown>
)
