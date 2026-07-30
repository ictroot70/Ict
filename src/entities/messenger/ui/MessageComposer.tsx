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
  const canSend = value.trim().length > 0

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend && !pending) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className={styles.composer}>
      {previewSlot && <div className={styles.previewArea}>{previewSlot}</div>}

      <div className={styles.inputArea}>
        <Input
          inputType={'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={'Type Message'}
          className={styles.input}
          disabled={disabled || pending}
        />

        <div className={styles.controls}>
          {actionsSlot}

          <Button
            onClick={onSend}
            variant={'text'}
            disabled={disabled || pending || !canSend}
            className={styles.sendBtn}
          >
            <Typography variant={'h3'}>{pending ? 'Sending...' : 'Send Message'}</Typography>
          </Button>
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
