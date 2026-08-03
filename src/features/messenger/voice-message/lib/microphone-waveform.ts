const BAR_COUNT = 112
const MIN_HEIGHT = 8
const SAMPLE_INTERVAL_MS = 50

type AudioContextWindow = Window & {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

export const createSilentWaveform = () => Array<number>(BAR_COUNT).fill(MIN_HEIGHT)

export function getMicrophoneBarHeight(samples: Uint8Array) {
  let squareSum = 0

  for (const sample of samples) {
    const normalizedSample = (sample - 128) / 128

    squareSum += normalizedSample * normalizedSample
  }

  const rms = Math.sqrt(squareSum / samples.length)

  return Math.round(Math.min(100, Math.max(MIN_HEIGHT, (rms - 0.01) * 900)))
}

export function observeMicrophoneWaveform(
  stream: MediaStream,
  onChange: (barHeights: number[]) => void
) {
  const browserWindow = window as AudioContextWindow
  const AudioContextConstructor = browserWindow.AudioContext ?? browserWindow.webkitAudioContext

  if (!AudioContextConstructor) {
    return () => undefined
  }

  const audioContext = new AudioContextConstructor()
  const analyser = audioContext.createAnalyser()
  const source = audioContext.createMediaStreamSource(stream)
  const samples = new Uint8Array(256)
  let animationFrameId = 0
  let lastSampleAt = 0
  let barHeights = createSilentWaveform()

  analyser.fftSize = 256
  analyser.smoothingTimeConstant = 0.7
  source.connect(analyser)

  const update = (timestamp: number) => {
    if (timestamp - lastSampleAt >= SAMPLE_INTERVAL_MS) {
      analyser.getByteTimeDomainData(samples)
      const nextHeight = getMicrophoneBarHeight(samples)

      barHeights = [...barHeights.slice(1), nextHeight]
      onChange(barHeights)
      lastSampleAt = timestamp
    }

    animationFrameId = requestAnimationFrame(update)
  }

  animationFrameId = requestAnimationFrame(update)

  return () => {
    cancelAnimationFrame(animationFrameId)
    source.disconnect()
    analyser.disconnect()
    void audioContext.close()
  }
}
