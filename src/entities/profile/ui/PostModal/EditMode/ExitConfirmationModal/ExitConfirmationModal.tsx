// components/ExitConfirmationModal.tsx
import { Button, Typography } from '@/shared/ui'
import s from '../EditMode.module.scss'

interface ExitConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null

  return (
    <div className={s.exitConfirmationOverlay} onClick={(e) => e.stopPropagation()}>
      <div className={s.exitConfirmationDialog}>
        <div className={s.exitConfirmationHeader}>
          <Typography variant="h3">Close Post</Typography>
          <Button variant="text" onClick={onClose} className={s.exitCloseButton}>
            ✕
          </Button>
        </div>

        <div className={s.exitConfirmationContent}>
          <Typography variant="regular_14">
            Do you really want to close the edition of the publication? If you close changes won't be saved
          </Typography>
        </div>

        <div className={s.exitConfirmationActions}>
          <Button variant="outlined" onClick={onClose} className={s.exitCancelButton}>
            No
          </Button>
          <Button variant="primary" onClick={onConfirm} className={s.exitConfirmButton}>
            Yes
          </Button>
        </div>
      </div>
    </div>
  )
}