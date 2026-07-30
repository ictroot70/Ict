'use client'

import React from 'react'

import { Button, Input, Typography } from '@ictroot/ui-kit'

import styles from './MessageComposer.module.scss'

interface MessageComposerProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  pending?: boolean
  error?: string | null
  previewSlot?: React.ReactNode
  actionsSlot?: React.ReactNode
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  value,
  onChange,
  onSend,
  disabled,
  pending,
  error,
  previewSlot,
  actionsSlot,
}) => {
  return (
    <div className={styles.composer}>
      {previewSlot && <div className={styles.previewArea}>{previewSlot}</div>}

      <div className={styles.inputArea}>
        <Input
          inputType={'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={'Type Message'}
          className={styles.input}
          disabled={disabled}
        />

        <div className={styles.controls}>
          {actionsSlot}

          {(value || previewSlot) && (
            <Button
              onClick={onSend}
              variant={'text'}
              disabled={disabled || pending}
              className={styles.sendBtn}
            >
              <Typography variant={'h3'}>{pending ? 'Sending...' : 'Send Message'}</Typography>
            </Button>
          )}
        </div>
      </div>
      {error && (
        <div className={styles.errorArea}>
          <Typography variant={'danger'}>{error}</Typography>
        </div>
      )}
    </div>
  )
}
