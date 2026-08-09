'use client'

import { useEffect, useState } from 'react'

import { AUDIO_WAVEFORM_BAR_COUNT } from '@/shared/lib/media/audio-waveform'

interface VoiceWaveformResponse {
  waveform?: number[]
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

    const waveformController = new AbortController()
    let disposed = false

    setBarHeights(null)

    void fetchServerWaveform(source, waveformController.signal)
      .then(nextBarHeights => {
        if (!disposed) {
          setBarHeights(nextBarHeights)
        }
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        console.error(error)
      })

    return () => {
      disposed = true
      waveformController.abort()
    }
  }, [barCount, source])

  return barHeights
}
