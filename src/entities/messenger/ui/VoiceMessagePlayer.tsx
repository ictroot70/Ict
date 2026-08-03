'use client'

import type { ReactNode } from 'react'

import { useAudioPlayer, useAudioWaveform } from '@/shared/hooks'
import { formatMediaDuration } from '@/shared/lib'
import { PauseCircle, PlayCircle } from '@ictroot/ui-kit/icons'

import styles from './VoiceMessagePlayer.module.scss'

import { VoiceWaveform } from './VoiceWaveform'

interface VoiceMessagePlayerProps {
  source: string
  playLabel: string
  pauseLabel: string
  className?: string
  fallbackDuration?: number
  waveform?: readonly number[]
  variant?: 'composer' | 'history'
  afterWaveformSlot?: ReactNode
  afterTimeSlot?: ReactNode
  isPlaybackRequested?: boolean
  onPlaybackEnded?: () => void
  onPlaybackPause?: () => void
  onPlaybackStart?: () => void
}

export function VoiceMessagePlayer({
  source,
  playLabel,
  pauseLabel,
  className,
  fallbackDuration = 0,
  waveform,
  variant = 'history',
  afterWaveformSlot,
  afterTimeSlot,
  isPlaybackRequested,
  onPlaybackEnded,
  onPlaybackPause,
  onPlaybackStart,
}: VoiceMessagePlayerProps) {
  const { audioRef, currentTime, duration, isPlaying, progress, togglePlayback } = useAudioPlayer(
    source,
    {
      isPlaybackRequested,
      onPlaybackEnded,
      onPlaybackPause,
      onPlaybackStart,
    }
  )
  const shouldDecodeWaveform = !waveform || !source.startsWith('blob:')
  const decodedWaveform = useAudioWaveform(shouldDecodeWaveform ? source : '')
  const barHeights = decodedWaveform ?? waveform
  const totalDuration = duration || fallbackDuration
  const isComposer = variant === 'composer'
  const isPlaybackControlled = isPlaybackRequested !== undefined
  const iconSize = isComposer ? 26 : 48
  const handleTogglePlayback = () => {
    if (!isPlaybackControlled) {
      void togglePlayback()

      return
    }

    if (isPlaybackRequested) {
      onPlaybackPause?.()

      return
    }

    onPlaybackStart?.()
  }

  return (
    <div
      className={`${styles.player} ${isComposer ? styles.composer : styles.history} ${
        className ?? ''
      }`}
    >
      <audio ref={audioRef} src={source} preload={'metadata'} />
      <button
        type={'button'}
        className={styles.playButton}
        onClick={handleTogglePlayback}
        aria-label={isPlaying ? pauseLabel : playLabel}
      >
        {isPlaying ? <PauseCircle size={iconSize} /> : <PlayCircle size={iconSize} />}
      </button>
      {isComposer ? (
        <>
          <VoiceWaveform progress={progress} barHeights={barHeights ?? undefined} />
          {afterWaveformSlot}
          <span className={styles.timer}>
            {currentTime > 0
              ? `${formatMediaDuration(currentTime)} / ${formatMediaDuration(totalDuration, true)}`
              : formatMediaDuration(totalDuration, true)}
          </span>
          {afterTimeSlot}
        </>
      ) : (
        <div className={styles.content}>
          <div className={styles.waveform}>
            <VoiceWaveform progress={progress} barHeights={barHeights ?? undefined} />
          </div>
          <div className={styles.meta}>
            {afterWaveformSlot}
            <span className={styles.timer}>
              {currentTime > 0
                ? `${formatMediaDuration(currentTime)} / ${formatMediaDuration(totalDuration, true)}`
                : formatMediaDuration(totalDuration, true)}
            </span>
            {afterTimeSlot && <span className={styles.metaEnd}>{afterTimeSlot}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
