import { Button, Modal, Typography } from '@ictroot/ui-kit'
import { ReactElement } from 'react'

interface LogoutModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  userEmail: string
}

export const LogoutModal = ({
  open,
  onClose,
  onConfirm,
  userEmail,
}: LogoutModalProps): ReactElement => (
  <Modal open={open} onClose={onClose} modalTitle="Confirm Logout" width="400px" height="auto">
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Typography variant="regular_16" style={{ marginBottom: '20px' }}>
        Are you really want to log out of your account <strong>{userEmail}</strong>?
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <Button variant="secondary" onClick={onClose}>
          No
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Yes
        </Button>
      </div>
    </div>
  </Modal>
)
