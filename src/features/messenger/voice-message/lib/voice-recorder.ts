export const MAX_VOICE_DURATION_SECONDS = 60
export const MAX_VOICE_SIZE_BYTES = 3 * 1024 * 1024
export const NORMALIZED_VOICE_SAMPLE_RATE = 16_000

const SUPPORTED_RECORDING_TYPES = [
  { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
  { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' },
  { mimeType: 'audio/mp4;codecs=mp4a.40.2', extension: 'm4a' },
  { mimeType: 'audio/mp4', extension: 'm4a' },
  { mimeType: 'audio/aac', extension: 'aac' },
  { mimeType: 'audio/mpeg', extension: 'mp3' },
  { mimeType: 'audio/ogg', extension: 'ogg' },
  { mimeType: 'audio/wav', extension: 'wav' },
  { mimeType: 'audio/webm', extension: 'webm' },
]

export interface VoiceRecordingFormat {
  mimeType: string
  extension: string
}

export function getSupportedRecordingFormat(): VoiceRecordingFormat | null {
  if (typeof MediaRecorder === 'undefined') {
    return null
  }

  return (
    SUPPORTED_RECORDING_TYPES.find(({ mimeType }) => MediaRecorder.isTypeSupported(mimeType)) ??
    null
  )
}

export function createVoiceFile(chunks: readonly Blob[], format: VoiceRecordingFormat): File {
  const blob = new Blob([...chunks], { type: format.mimeType })

  return new File([blob], `voice-message-${Date.now()}.${format.extension}`, {
    type: format.mimeType,
  })
}

export function isVoiceFileWithinSizeLimit(file: File): boolean {
  return file.size <= MAX_VOICE_SIZE_BYTES
}

function mixAudioBufferToMono(audioBuffer: AudioBuffer): Float32Array {
  const monoSamples = new Float32Array(audioBuffer.length)

  for (let channelIndex = 0; channelIndex < audioBuffer.numberOfChannels; channelIndex += 1) {
    const channel = audioBuffer.getChannelData(channelIndex)

    for (let sampleIndex = 0; sampleIndex < channel.length; sampleIndex += 1) {
      monoSamples[sampleIndex] += channel[sampleIndex] / audioBuffer.numberOfChannels
    }
  }

  return monoSamples
}

function resampleAudio(
  samples: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (sourceSampleRate === targetSampleRate) {
    return samples
  }

  const outputLength = Math.max(
    1,
    Math.round((samples.length * targetSampleRate) / sourceSampleRate)
  )
  const output = new Float32Array(outputLength)
  const sampleRateRatio = sourceSampleRate / targetSampleRate

  for (let outputIndex = 0; outputIndex < outputLength; outputIndex += 1) {
    const sourcePosition = outputIndex * sampleRateRatio
    const firstIndex = Math.floor(sourcePosition)
    const secondIndex = Math.min(firstIndex + 1, samples.length - 1)
    const interpolation = sourcePosition - firstIndex

    output[outputIndex] =
      samples[firstIndex] + (samples[secondIndex] - samples[firstIndex]) * interpolation
  }

  return output
}

export function encodePcm16Wav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const bytesPerSample = 2
  const headerSize = 44
  const dataSize = samples.length * bytesPerSample
  const buffer = new ArrayBuffer(headerSize + dataSize)
  const view = new DataView(buffer)

  const writeText = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index))
    }
  }

  writeText(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * bytesPerSample, true)
  view.setUint16(32, bytesPerSample, true)
  view.setUint16(34, 16, true)
  writeText(36, 'data')
  view.setUint32(40, dataSize, true)

  samples.forEach((sample, index) => {
    const clampedSample = Math.max(-1, Math.min(1, sample))
    const pcmValue =
      clampedSample < 0 ? Math.round(clampedSample * 0x8000) : Math.round(clampedSample * 0x7fff)

    view.setInt16(headerSize + index * bytesPerSample, pcmValue, true)
  })

  return buffer
}

type WindowWithWebkitAudioContext = Window & {
  webkitAudioContext?: typeof AudioContext
}

function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer()
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)

        return
      }

      reject(new Error('Audio file could not be read'))
    })
    reader.addEventListener('error', () => {
      reject(reader.error ?? new Error('Audio file could not be read'))
    })
    reader.readAsArrayBuffer(blob)
  })
}

export async function normalizeVoiceRecording(
  chunks: readonly Blob[],
  format: VoiceRecordingFormat
): Promise<File> {
  const AudioContextConstructor =
    window.AudioContext ?? (window as WindowWithWebkitAudioContext).webkitAudioContext

  if (!AudioContextConstructor) {
    throw new Error('Audio decoding is not supported')
  }

  const sourceFile = createVoiceFile(chunks, format)
  const audioContext = new AudioContextConstructor()

  try {
    const audioBuffer = await audioContext.decodeAudioData(await readBlobAsArrayBuffer(sourceFile))
    const monoSamples = mixAudioBufferToMono(audioBuffer)
    const normalizedSamples = resampleAudio(
      monoSamples,
      audioBuffer.sampleRate,
      NORMALIZED_VOICE_SAMPLE_RATE
    )
    const wavBuffer = encodePcm16Wav(normalizedSamples, NORMALIZED_VOICE_SAMPLE_RATE)

    return new File([wavBuffer], `voice-message-${Date.now()}.wav`, {
      type: 'audio/wav',
    })
  } finally {
    await audioContext.close()
  }
}
