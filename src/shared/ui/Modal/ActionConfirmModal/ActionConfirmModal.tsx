import { Button, CheckboxRadix, Modal, Typography, Variant } from '@/shared/ui'
import { ReactElement } from 'react'
import styles from './ActionConfirmModal.module.scss'

type ModalButtonProps = {
  label: string
  onClick: () => void
  variant?: Variant
  fullWidth?: boolean
}

interface ActionConfirmModalProps {
  open: boolean
  onClose: () => void
  title: string
  message: string
  highlightedText?: string
  confirmButton: ModalButtonProps
  cancelButton?: ModalButtonProps
  checkbox?: boolean

  width?: string
  height?: string
}

export const ActionConfirmModal = ({
  open,
  onClose,
  title,
  message,
  highlightedText,
  confirmButton,
  cancelButton,
  checkbox,
  width = '438px',
  height = '240px',
}: ActionConfirmModalProps): ReactElement => (
  <Modal open={open} onClose={onClose} modalTitle={title} width={width} height={height}>
    <div>
      <Typography variant="regular_16" className={styles.text}>
        {message}
        <span className={styles.userEmail}> “{highlightedText}”</span>?
      </Typography>
      <div className={checkbox ? styles.checkbox : ''}>
        {checkbox && <CheckboxRadix label="I agree" onChange={() => {}} />}
        <div className={styles.wrapper}>
          {confirmButton && (
            <Button
              variant={confirmButton.variant ?? 'outlined'}
              onClick={confirmButton.onClick}
              fullWidth={confirmButton.fullWidth}
            >
              {confirmButton.label}
            </Button>
          )}
          {cancelButton && (
            <Button
              variant={cancelButton?.variant ?? 'primary'}
              onClick={cancelButton?.onClick}
              fullWidth={cancelButton?.fullWidth}
            >
              {cancelButton?.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  </Modal>
)
