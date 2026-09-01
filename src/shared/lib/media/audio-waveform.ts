export const AUDIO_WAVEFORM_BAR_COUNT = 112
export const AUDIO_WAVEFORM_MIN_BAR_HEIGHT = 8

type AudioContextWindow = Window & {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

const normalizeBarHeight = (value: number) =>
  Math.round(
    AUDIO_WAVEFORM_MIN_BAR_HEIGHT +
      Math.min(1, Math.max(0, value)) * (100 - AUDIO_WAVEFORM_MIN_BAR_HEIGHT)
  )

export function createSilentAudioWaveform(barCount = AUDIO_WAVEFORM_BAR_COUNT) {
  return Array<number>(barCount).fill(AUDIO_WAVEFORM_MIN_BAR_HEIGHT)
}

export function getAudioWaveformBarHeights(
  samples: Float32Array,
  barCount = AUDIO_WAVEFORM_BAR_COUNT
) {
  const segmentSize = Math.max(1, Math.floor(samples.length / barCount))
  const rmsValues = Array.from({ length: barCount }, (_, barIndex) => {
    const start = barIndex * segmentSize
    const end = Math.min(samples.length, start + segmentSize)
    let squareSum = 0

    for (let index = start; index < end; index += 1) {
      squareSum += samples[index] * samples[index]
    }

    return Math.sqrt(squareSum / Math.max(1, end - start))
  })
  const smoothedValues = rmsValues.map((value, index) => {
    const previous = rmsValues[index - 1] ?? value
    const next = rmsValues[index + 1] ?? value

    return value * 0.7 + previous * 0.15 + next * 0.15
  })
  const sortedValues = [...smoothedValues].sort((first, second) => first - second)
  const referenceIndex = Math.max(0, Math.ceil(sortedValues.length * 0.95) - 1)
  const referenceValue = Math.max(sortedValues[referenceIndex] ?? 0, 0.01)

  return smoothedValues.map(value => normalizeBarHeight(value / referenceValue))
}

const getAudioContextConstructor = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const browserWindow = window as AudioContextWindow

  return browserWindow.AudioContext ?? browserWindow.webkitAudioContext ?? null
}

export async function createAudioWaveformFromArrayBuffer(
  buffer: ArrayBuffer,
  barCount = AUDIO_WAVEFORM_BAR_COUNT
) {
  const { getAudioWaveformFromPcm16Wav } = await import('./wav-audio-waveform')
  const wavWaveform = getAudioWaveformFromPcm16Wav(buffer, barCount)

  if (wavWaveform) {
    return wavWaveform
  }

  const AudioContextConstructor = getAudioContextConstructor()

  if (!AudioContextConstructor) {
    return createSilentAudioWaveform(barCount)
  }

  const audioContext = new AudioContextConstructor()

  try {
    const audioBuffer = await audioContext.decodeAudioData(buffer.slice(0))

    return getAudioWaveformBarHeights(audioBuffer.getChannelData(0), barCount)
  } finally {
    void audioContext.close()
  }
}

export async function createAudioWaveformFromBlob(blob: Blob, barCount = AUDIO_WAVEFORM_BAR_COUNT) {
  return createAudioWaveformFromArrayBuffer(await blob.arrayBuffer(), barCount)
}
