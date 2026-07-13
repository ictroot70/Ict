import React, { useState } from 'react'

import { ImageOutline } from '@/shared/ui'
import { Button, Input } from '@ictroot/ui-kit'
import { MicOutline } from '@ictroot/ui-kit/icons'

import styles from './MessageComposer.module.scss'

interface MessageComposerProps {
  onSendMessage?: (text: string) => void
  onSendImage?: (file: File) => void
  onSendVoice?: (blob: Blob) => void
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onSendImage,
  onSendVoice,
}) => {
  const [text, setText] = useState('')
  const [hasImage, setHasImage] = useState(false)
  const [hasVoice, setHasVoice] = useState(false)

  return (
    <div className={styles.composer}>
      {/* Preview Area */}
      {(hasImage || hasVoice) && (
        <div className={styles.previewArea}>
          {hasImage && (
            <div className={styles.previewItem}>
              Image Preview
              <Button onClick={() => setHasImage(false)} className={styles.removeBtn}>
                ✕
              </Button>
            </div>
          )}
          {hasVoice && (
            <div className={styles.previewItem}>
              Voice Preview
              <Button onClick={() => setHasVoice(false)} className={styles.removeBtn}>
                ✕
              </Button>
            </div>
          )}
        </div>
      )}

      <div className={styles.inputArea}>
        <Input
          inputType={'text'}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={'Type message...'}
          className={styles.input}
        />

        {!text && (
          <>
            <Button
              onClick={() => setHasVoice(true)}
              className={styles.actionBtn}
              title={'Record voice'}
            >
              <MicOutline />
            </Button>
            <Button
              onClick={() => setHasImage(true)}
              className={styles.actionBtn}
              title={'Attach image'}
            >
              <ImageOutline />
            </Button>
          </>
        )}

        {(text || hasImage || hasVoice) && (
          <Button
            onClick={() => onSendMessage?.(text)}
            variant={'text'}
            disabled={!text && !hasImage && !hasVoice}
            className={
              text || hasImage || hasVoice
                ? styles.sendBtn + ' ' + styles.active
                : styles.sendBtn + ' ' + styles.disabled
            }
          >
            {hasVoice ? 'Send Voice' : 'Send Message'}
          </Button>
        )}
      </div>
    </div>
  )
}
