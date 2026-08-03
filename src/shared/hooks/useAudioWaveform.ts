'use client'

import { useEffect, useState } from 'react'

import {
  AUDIO_WAVEFORM_BAR_COUNT,
  createAudioWaveformFromArrayBuffer,
} from '@/shared/lib/media/audio-waveform'

interface VoiceWaveformResponse {
  waveform?: number[]
}

const canRequestServerWaveform = (source: string) => {
  try {
    const url = new URL(source)

    return url.protocol === 'https:'
  } catch {
    return false
  }
}

const fetchServerWaveform = async (source: string, signal: AbortSignal) => {
  const response = await fetch(`/api/messenger/voice-waveform?url=${encodeURIComponent(source)}`, {
    signal,
  })

  if (!response.ok) {
    throw new Error('Could not load server voice waveform')
  }

  const data = (await response.json()) as VoiceWaveformResponse

  if (!Array.isArray(data.waveform)) {
    throw new Error('Invalid server voice waveform')
  }

  return data.waveform
}

export function useAudioWaveform(source: string, barCount = AUDIO_WAVEFORM_BAR_COUNT) {
  const [barHeights, setBarHeights] = useState<number[] | null>(null)

  useEffect(() => {
    if (!source) {
      setBarHeights(null)

      return
    }

    const controller = new AbortController()
    let disposed = false

    setBarHeights(null)

    void fetch(source, { signal: controller.signal })
      .then(response => {
        if (!response.ok) {
          throw new Error('Could not load audio waveform')
        }

        return response.arrayBuffer()
      })
      .then(buffer => createAudioWaveformFromArrayBuffer(buffer, barCount))
      .then(nextBarHeights => {
        if (!disposed) {
          setBarHeights(nextBarHeights)
        }
      })
      .catch(() => {
        if (!canRequestServerWaveform(source)) {
          return undefined
        }

        return fetchServerWaveform(source, controller.signal)
          .then(nextBarHeights => {
            if (!disposed) {
              setBarHeights(nextBarHeights)
            }
          })
          .catch(() => undefined)
      })

    return () => {
      disposed = true
      controller.abort()
    }
  }, [barCount, source])

  return barHeights
}
