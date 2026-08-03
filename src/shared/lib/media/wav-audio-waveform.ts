import { AUDIO_WAVEFORM_BAR_COUNT, getAudioWaveformBarHeights } from './audio-waveform'

const RIFF_HEADER = 'RIFF'
const WAVE_HEADER = 'WAVE'
const FORMAT_CHUNK = 'fmt '
const DATA_CHUNK = 'data'
const PCM_AUDIO_FORMAT = 1
const PCM_16_BITS = 16

const readAscii = (view: DataView, offset: number, length: number) =>
  Array.from({ length }, (_, index) => String.fromCharCode(view.getUint8(offset + index))).join('')

export function getPcm16WavSamples(buffer: ArrayBuffer): Float32Array | null {
  if (buffer.byteLength < 44) {
    return null
  }

  const view = new DataView(buffer)

  if (readAscii(view, 0, 4) !== RIFF_HEADER || readAscii(view, 8, 4) !== WAVE_HEADER) {
    return null
  }

  let offset = 12
  let channels = 0
  let bitsPerSample = 0
  let audioFormat = 0
  let dataOffset = 0
  let dataSize = 0

  while (offset + 8 <= view.byteLength) {
    const chunkId = readAscii(view, offset, 4)
    const chunkSize = view.getUint32(offset + 4, true)
    const chunkDataOffset = offset + 8

    if (chunkDataOffset + chunkSize > view.byteLength) {
      return null
    }

    if (chunkId === FORMAT_CHUNK) {
      audioFormat = view.getUint16(chunkDataOffset, true)
      channels = view.getUint16(chunkDataOffset + 2, true)
      bitsPerSample = view.getUint16(chunkDataOffset + 14, true)
    }

    if (chunkId === DATA_CHUNK) {
      dataOffset = chunkDataOffset
      dataSize = chunkSize
    }

    offset = chunkDataOffset + chunkSize + (chunkSize % 2)
  }

  if (
    audioFormat !== PCM_AUDIO_FORMAT ||
    channels <= 0 ||
    bitsPerSample !== PCM_16_BITS ||
    dataOffset === 0 ||
    dataSize === 0
  ) {
    return null
  }

  const bytesPerSample = bitsPerSample / 8
  const frameCount = Math.floor(dataSize / (bytesPerSample * channels))
  const samples = new Float32Array(frameCount)

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    let sampleSum = 0

    for (let channelIndex = 0; channelIndex < channels; channelIndex += 1) {
      const sampleOffset = dataOffset + (frameIndex * channels + channelIndex) * bytesPerSample

      sampleSum += view.getInt16(sampleOffset, true) / 32768
    }

    samples[frameIndex] = sampleSum / channels
  }

  return samples
}

export function getAudioWaveformFromPcm16Wav(
  buffer: ArrayBuffer,
  barCount = AUDIO_WAVEFORM_BAR_COUNT
) {
  const samples = getPcm16WavSamples(buffer)

  return samples ? getAudioWaveformBarHeights(samples, barCount) : null
}
