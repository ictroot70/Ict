'use client'

import React, { useRef } from 'react'

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
  /** Image/voice attachments can be sent without text. */
  hasAttachment?: boolean
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
  hasAttachment = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const canSend = value.trim().length > 0 || hasAttachment

  const handleSend = () => {
    if (!canSend || pending || disabled) {
      return
    }

    onSend()
    queueMicrotask(() => inputRef.current?.focus())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend && !pending) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.composer}>
      {previewSlot && <div className={styles.previewArea}>{previewSlot}</div>}

      <div className={styles.inputArea}>
        <Input
          ref={inputRef}
          inputType={'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={'Type Message'}
          className={styles.input}
          disabled={disabled}
        />

        <div className={styles.controls}>
          {actionsSlot}

          <Button
            onClick={handleSend}
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
