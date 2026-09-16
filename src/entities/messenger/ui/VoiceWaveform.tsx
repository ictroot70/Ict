import styles from './VoiceWaveform.module.scss'

const BASE_BAR_HEIGHTS = [
  38, 68, 46, 82, 56, 30, 72, 48, 90, 62, 36, 76, 52, 86, 42, 64, 34, 80, 58, 44, 74, 50, 88, 40,
  66, 32, 78, 54, 84, 46, 70, 36, 92, 60, 42, 76, 50, 82, 56, 34,
]
const BAR_HEIGHTS = [...BASE_BAR_HEIGHTS, ...BASE_BAR_HEIGHTS, ...BASE_BAR_HEIGHTS.slice(0, 32)]

interface VoiceWaveformProps {
  progress?: number
  active?: boolean
  barHeights?: readonly number[]
  layout?: 'composer' | 'history'
}

export function VoiceWaveform({
  progress = 0,
  active = false,
  barHeights,
  layout = 'composer',
}: VoiceWaveformProps) {
  const normalizedProgress = Math.min(1, Math.max(0, progress))
  const heights = barHeights?.length ? barHeights : BAR_HEIGHTS

  return (
    <div
      className={`${styles.waveform} ${layout === 'history' ? styles.history : ''}`}
      aria-hidden={'true'}
    >
      {heights.map((height, index) => {
        const played = (index + 1) / heights.length <= normalizedProgress

        return (
          <span
            key={`${height}-${index}`}
            className={`${styles.bar} ${played ? styles.played : ''} ${
              active ? styles.active : ''
            }`}
            style={{ height: `${Math.min(100, Math.max(8, height))}%` }}
          />
        )
      })}
    </div>
  )
}
