'use client'

import React, { useState } from 'react'

import { ImageOutline, PlusCircle } from '@/shared/ui'
import { Button, Input, Typography } from '@ictroot/ui-kit'
import { MicOutline, PlayCircle, PauseCircle, PlusCircleOutline } from '@ictroot/ui-kit/icons'

import styles from './MessageComposer.module.scss'

interface MessageComposerProps {
  onSendMessage?: (text: string) => void
  onSendImage?: (file: File) => void
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('')
  const [images, setImages] = useState<number[]>([])
  const [hasVoice, setHasVoice] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voiceDuration, setVoiceDuration] = useState('00:00')
  const [waveformHeights, setWaveformHeights] = useState<number[]>([])

  return (
    <div className={styles.composer}>
      {/* Preview Area */}
      {(images.length > 0 || hasVoice) && (
        <div className={styles.previewArea}>
          {images.map((_, index) => (
            <div key={index} className={styles.previewItem}>
              <ImageOutline />
              <Button
                onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                className={styles.removeBtn}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            onClick={() => setImages(prev => [...prev, prev.length])}
            className={styles.addPreviewBtn}
            title={'Add image'}
            variant={'text'}
          >
            <PlusCircleOutline />
          </Button>
        </div>
      )}

      <div className={styles.inputArea}>
        {isRecording ? (
          <div className={styles.recordingArea}>
            <div className={styles.recordingControls}>
              <Button
                onClick={() => setIsRecording(false)}
                className={styles.voiceActionBtn}
                title={'Cancel recording'}
                variant={'text'}
              >
                <PlusCircle className={styles.plusCircle} />
              </Button>
              <Button
                className={styles.voiceActionBtn}
                title={isPaused ? 'Resume recording' : 'Pause recording'}
                variant={'text'}
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <PlayCircle /> : <PauseCircle />}
              </Button>
            </div>
            <div className={styles.waveformContainer}>
              <div className={styles.waveform}>
                {waveformHeights.map((height, i) => (
                  <div
                    key={i}
                    className={styles.waveformBar}
                    style={{
                      height: `${height}%`,
                    }}
                  />
                ))}
              </div>
              <div className={styles.redDot}></div>
              <span className={styles.timer}>{voiceDuration}</span>
            </div>
            <div className={styles.recordingActions}>
              <Button
                onClick={() => {
                  setIsRecording(false)
                }}
                className={styles.sendVoiceBtn}
                title={'Send voice'}
                variant={'text'}
              >
                Send voice
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Input
              inputType={'text'}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={'Type Message'}
              className={styles.input}
            />

            <div className={styles.controls}>
              {!text && images.length == 0 && !hasVoice && (
                <>
                  <Button
                    onClick={() => {
                      setIsRecording(true)
                      setWaveformHeights([...Array(100)].map(() => Math.random() * 100))
                    }}
                    className={styles.actionBtn}
                    title={'Record voice'}
                  >
                    <MicOutline />
                  </Button>
                  <Button
                    onClick={() => setImages(prev => [...prev, prev.length])}
                    className={styles.actionBtn}
                    title={'Attach image'}
                  >
                    <ImageOutline />
                  </Button>
                </>
              )}

              {(text || images.length > 0 || hasVoice) && (
                <Button
                  onClick={() => onSendMessage?.(text)}
                  variant={'text'}
                  disabled={!text && images.length === 0 && !hasVoice}
                  className={styles.sendBtn}
                >
                  <Typography variant={'h3'}>Send Message</Typography>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
