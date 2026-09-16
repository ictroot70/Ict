import { getAudioWaveformFromPcm16Wav } from '@/shared/lib/media/wav-audio-waveform'
import { NextResponse } from 'next/server'

const MAX_AUDIO_BYTES = 3 * 1024 * 1024
const ALLOWED_MEDIA_HOSTS = new Set([
  'ictroot.uk',
  'inctagram.work',
  'staging-it-incubator.s3.eu-central-1.amazonaws.com',
])

const isAllowedMediaUrl = (url: URL) =>
  url.protocol === 'https:' && ALLOWED_MEDIA_HOSTS.has(url.hostname)

export async function GET(request: Request) {
  const url = new URL(request.url)
  const source = url.searchParams.get('url')

  if (!source) {
    return NextResponse.json({ error: 'Missing voice file URL' }, { status: 400 })
  }

  let sourceUrl: URL

  try {
    sourceUrl = new URL(source)
  } catch {
    return NextResponse.json({ error: 'Invalid voice file URL' }, { status: 400 })
  }

  if (!isAllowedMediaUrl(sourceUrl)) {
    return NextResponse.json({ error: 'Voice file host is not allowed' }, { status: 400 })
  }

  const response = await fetch(sourceUrl, { cache: 'no-store' })
  const contentLength = Number(response.headers.get('content-length') ?? 0)

  if (!response.ok) {
    return NextResponse.json({ error: 'Could not load voice file' }, { status: 502 })
  }

  if (contentLength > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: 'Voice file is too large' }, { status: 413 })
  }

  const buffer = await response.arrayBuffer()

  if (buffer.byteLength > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: 'Voice file is too large' }, { status: 413 })
  }

  const waveform = getAudioWaveformFromPcm16Wav(buffer)

  if (!waveform) {
    return NextResponse.json({ error: 'Voice waveform is not available' }, { status: 422 })
  }

  return NextResponse.json({ waveform })
}
