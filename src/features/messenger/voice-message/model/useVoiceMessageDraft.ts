'use client'

import type {
  UseVoiceMessageDraftOptions,
  VoiceDraftError,
  VoiceDraftStatus,
} from './voice-draft.types'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useSendVoiceMessageMutation } from '@/entities/messenger'

import { createSilentWaveform, observeMicrophoneWaveform } from '../lib/microphone-waveform'
import { prepareVoicePreviewDraft } from '../lib/prepare-voice-preview-draft'
import { sendOptimisticVoiceMessage } from '../lib/send-optimistic-voice-message'
import {
  getSupportedRecordingFormat,
  MAX_VOICE_DURATION_SECONDS,
  MAX_VOICE_SIZE_BYTES,
  type VoiceRecordingFormat,
} from '../lib/voice-recorder'

export function useVoiceMessageDraft({
  receiverId,
  senderId,
  onSendStarted,
  onSent,
  onSendFailed,
}: UseVoiceMessageDraftOptions) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const bytesRecordedRef = useRef(0)
  const durationRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const stopWaveformRef = useRef<(() => void) | null>(null)
  const waveformRef = useRef(createSilentWaveform())
  const formatRef = useRef<VoiceRecordingFormat | null>(null)
  const requestIdRef = useRef(0)
  const sizeExceededRef = useRef(false)
  const [sendVoiceMessage] = useSendVoiceMessageMutation()
  const [status, setStatus] = useState<VoiceDraftStatus>('idle')
  const [duration, setDuration] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<VoiceDraftError | null>(null)
  const [waveform, setWaveform] = useState(createSilentWaveform)

  const updateWaveform = useCallback((nextWaveform: number[]) => {
    waveformRef.current = nextWaveform
    setWaveform(nextWaveform)
  }, [])

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  const cleanupRecorder = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }

    clearTimer()
    stopWaveformRef.current?.()
    stopWaveformRef.current = null
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    recorderRef.current = null
  }, [clearTimer])

  const resetDraft = useCallback(() => {
    requestIdRef.current += 1
    cleanupRecorder()
    releaseObjectUrl()
    chunksRef.current = []
    bytesRecordedRef.current = 0
    durationRef.current = 0
    sizeExceededRef.current = false
    formatRef.current = null
    setDuration(0)
    setFile(null)
    setPreviewUrl(null)
    setError(null)
    updateWaveform(createSilentWaveform())
    setStatus('idle')
  }, [cleanupRecorder, releaseObjectUrl, updateWaveform])

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current

    if (recorder?.state === 'recording') {
      recorder.stop()
    }
  }, [])

  const startRecording = useCallback(async () => {
    const format = getSupportedRecordingFormat()

    if (!navigator.mediaDevices?.getUserMedia || !format) {
      setError('unsupported')

      return
    }

    resetDraft()
    const requestId = requestIdRef.current

    setStatus('requesting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      if (requestId !== requestIdRef.current) {
        stream.getTracks().forEach(track => track.stop())

        return
      }

      const recorder = new MediaRecorder(stream, { mimeType: format.mimeType })

      streamRef.current = stream
      stopWaveformRef.current = observeMicrophoneWaveform(stream, updateWaveform)
      recorderRef.current = recorder
      formatRef.current = format
      chunksRef.current = []
      bytesRecordedRef.current = 0
      sizeExceededRef.current = false

      recorder.addEventListener('dataavailable', event => {
        if (requestId !== requestIdRef.current) {
          return
        }

        if (event.data.size === 0) {
          return
        }

        chunksRef.current.push(event.data)
        bytesRecordedRef.current += event.data.size

        if (bytesRecordedRef.current > MAX_VOICE_SIZE_BYTES && recorder.state === 'recording') {
          sizeExceededRef.current = true
          recorder.stop()
        }
      })

      recorder.addEventListener('stop', () => {
        cleanupRecorder()

        if (requestId !== requestIdRef.current) {
          return
        }

        if (sizeExceededRef.current || !formatRef.current) {
          setError('sizeExceeded')
          setStatus('idle')

          return
        }

        const recordedChunks = [...chunksRef.current]
        const recordedFormat = formatRef.current

        setStatus('processing')

        void prepareVoicePreviewDraft(recordedChunks, recordedFormat, waveformRef.current)
          .then(previewDraft => {
            if (requestId !== requestIdRef.current) {
              return
            }

            if (!previewDraft) {
              setError('sizeExceeded')
              setStatus('idle')

              return
            }

            const url = URL.createObjectURL(previewDraft.file)

            objectUrlRef.current = url
            setFile(previewDraft.file)
            setPreviewUrl(url)
            setDuration(durationRef.current)
            updateWaveform([...previewDraft.waveform])
            setStatus('preview')
          })
          .catch(() => {
            if (requestId !== requestIdRef.current) {
              return
            }

            setError('recordingFailed')
            setStatus('idle')
          })
      })

      recorder.start(1000)
      setStatus('recording')

      intervalRef.current = setInterval(() => {
        durationRef.current = Math.min(durationRef.current + 1, MAX_VOICE_DURATION_SECONDS)
        setDuration(durationRef.current)

        if (durationRef.current >= MAX_VOICE_DURATION_SECONDS) {
          stopRecording()
        }
      }, 1000)
    } catch (recordingError) {
      cleanupRecorder()
      setStatus('idle')
      setError(
        recordingError instanceof DOMException &&
          (recordingError.name === 'NotAllowedError' || recordingError.name === 'SecurityError')
          ? 'permissionDenied'
          : 'recordingFailed'
      )
    }
  }, [cleanupRecorder, resetDraft, stopRecording, updateWaveform])

  const send = useCallback(async () => {
    if (!file || !previewUrl) {
      return
    }

    const recordedDuration = duration
    const restoreDraft = () => {
      const retryUrl = URL.createObjectURL(file)

      objectUrlRef.current = retryUrl
      setFile(file)
      setPreviewUrl(retryUrl)
      setDuration(recordedDuration)
      setWaveform(waveform)
      setError('sendFailed')
      setStatus('preview')
    }

    await sendOptimisticVoiceMessage({
      file,
      receiverId,
      senderId,
      waveform,
      upload: () => sendVoiceMessage({ receiverId, file }).unwrap(),
      clearDraft: resetDraft,
      restoreDraft,
      onSendStarted,
      onSent,
      onSendFailed,
    })
  }, [
    duration,
    file,
    onSendFailed,
    onSendStarted,
    onSent,
    previewUrl,
    receiverId,
    resetDraft,
    sendVoiceMessage,
    senderId,
    waveform,
  ])

  useEffect(
    () => () => {
      requestIdRef.current += 1
      cleanupRecorder()
      releaseObjectUrl()
    },
    [cleanupRecorder, releaseObjectUrl]
  )

  return {
    duration,
    error,
    previewUrl,
    status,
    waveform,
    discard: resetDraft,
    send,
    startRecording,
    stopRecording,
  }
}
