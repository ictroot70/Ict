// components/EditModeHeader.tsx
import { Button, Typography } from '@/shared/ui'
import { Header } from '@/features/posts/ui/Header/header'
import s from '../EditMode.module.scss'

interface EditModeHeaderProps {
  isEditing: boolean
  title: string
  onClose: () => void
  onSave?: () => void
  isSaveDisabled?: boolean
  saveButtonText?: string
}

export const EditModeHeader: React.FC<EditModeHeaderProps> = ({
  isEditing,
  title,
  onClose,
  onSave,
  isSaveDisabled = false,
  saveButtonText = 'Save',
}) => {
  if (isEditing) {
    return (
      <div className={s.editHeader}>
        <Typography variant="h1" className={s.editTitle}>
          {title}
        </Typography>
        <Button variant="text" onClick={onClose} className={s.closeButton}>
          ✕
        </Button>
      </div>
    )
  }

  return (
    <Header
      onPrev={onClose}
      onNext={onSave}
      title={title}
      nextStepTitle={saveButtonText}
      disabledNext={isSaveDisabled}
    />
  )
}