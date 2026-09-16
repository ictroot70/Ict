'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAudioPlayerOptions {
  isPlaybackRequested?: boolean
  onPlaybackEnded?: () => void
  onPlaybackPause?: () => void
  onPlaybackStart?: () => void
}

export function useAudioPlayer(source: string, options: UseAudioPlayerOptions = {}) {
  const { isPlaybackRequested, onPlaybackEnded, onPlaybackPause, onPlaybackStart } = options
  const audioRef = useRef<HTMLAudioElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const onPlaybackEndedRef = useRef(onPlaybackEnded)
  const onPlaybackPauseRef = useRef(onPlaybackPause)
  const onPlaybackStartRef = useRef(onPlaybackStart)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  onPlaybackEndedRef.current = onPlaybackEnded
  onPlaybackPauseRef.current = onPlaybackPause
  onPlaybackStartRef.current = onPlaybackStart

  const syncAudioState = useCallback(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    setCurrentTime(audio.currentTime)
    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
  }, [])

  const stopProgressSync = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const startProgressSync = useCallback(() => {
    if (animationFrameRef.current !== null) {
      return
    }

    const syncProgress = () => {
      const audio = audioRef.current

      if (!audio) {
        animationFrameRef.current = null

        return
      }

      setCurrentTime(audio.currentTime)
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)

      if (!audio.paused && !audio.ended) {
        animationFrameRef.current = window.requestAnimationFrame(syncProgress)

        return
      }

      animationFrameRef.current = null
    }

    animationFrameRef.current = window.requestAnimationFrame(syncProgress)
  }, [])

  const playAudio = useCallback(async () => {
    const audio = audioRef.current

    if (!audio || !audio.paused) {
      return
    }

    try {
      if (audio.ended) {
        audio.currentTime = 0
      }

      await audio.play()
      syncAudioState()
      startProgressSync()
    } catch {
      setIsPlaying(false)
      onPlaybackPauseRef.current?.()
    }
  }, [startProgressSync, syncAudioState])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    const handleTimeUpdate = () => syncAudioState()
    const handleDurationChange = () => syncAudioState()
    const handlePlay = () => {
      setIsPlaying(true)
      onPlaybackStartRef.current?.()
      startProgressSync()
    }
    const handlePause = () => {
      setIsPlaying(false)
      syncAudioState()
      stopProgressSync()

      if (!audio.ended) {
        onPlaybackPauseRef.current?.()
      }
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(audio.duration || 0)
      stopProgressSync()
      onPlaybackEndedRef.current?.()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('loadedmetadata', handleDurationChange)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      stopProgressSync()
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('loadedmetadata', handleDurationChange)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
    }
  }, [source, startProgressSync, stopProgressSync, syncAudioState])

  useEffect(() => {
    if (isPlaybackRequested === undefined) {
      return
    }

    const audio = audioRef.current

    if (!audio) {
      return
    }

    if (isPlaybackRequested) {
      void playAudio()

      return
    }

    if (!audio.paused) {
      audio.pause()
      syncAudioState()
      stopProgressSync()
    }
  }, [isPlaybackRequested, playAudio, source, stopProgressSync, syncAudioState])

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    if (audio.paused) {
      await playAudio()

      return
    }

    audio.pause()
    syncAudioState()
    stopProgressSync()
  }, [playAudio, stopProgressSync, syncAudioState])

  return {
    audioRef,
    currentTime,
    duration,
    isPlaying,
    progress: duration > 0 ? currentTime / duration : 0,
    togglePlayback,
  }
}
