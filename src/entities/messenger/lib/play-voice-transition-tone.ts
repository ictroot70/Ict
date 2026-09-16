'use client'

type AudioContextWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

const TRANSITION_TONE_DURATION_SECONDS = 0.22
const TRANSITION_NOTES = [
  {
    durationSeconds: 0.075,
    frequency: 760,
    peakGain: 0.16,
    startOffsetSeconds: 0,
  },
  {
    durationSeconds: 0.11,
    frequency: 1180,
    peakGain: 0.18,
    startOffsetSeconds: 0.095,
  },
] as const

type ScheduledTransitionNode = {
  gain: GainNode
  oscillator: OscillatorNode
}

function scheduleTransitionNote(
  audioContext: AudioContext,
  note: (typeof TRANSITION_NOTES)[number],
  baseStartTime: number
) {
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const startTime = baseStartTime + note.startOffsetSeconds
  const endTime = startTime + note.durationSeconds

  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(note.frequency, startTime)
  oscillator.frequency.exponentialRampToValueAtTime(note.frequency * 0.92, endTime)

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(note.peakGain, startTime + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime)

  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(startTime)
  oscillator.stop(endTime)

  return { gain, oscillator }
}

export async function playVoiceTransitionTone() {
  const AudioContextConstructor =
    window.AudioContext ?? (window as AudioContextWindow).webkitAudioContext

  if (!AudioContextConstructor) {
    return
  }

  const audioContext = new AudioContextConstructor()
  const scheduledNodes: ScheduledTransitionNode[] = []

  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    const startTime = audioContext.currentTime + 0.01

    scheduledNodes.push(
      ...TRANSITION_NOTES.map(note => scheduleTransitionNote(audioContext, note, startTime))
    )

    await new Promise<void>(resolve => {
      window.setTimeout(resolve, TRANSITION_TONE_DURATION_SECONDS * 1000)
    })
  } finally {
    scheduledNodes.forEach(({ gain, oscillator }) => {
      oscillator.disconnect()
      gain.disconnect()
    })
    await audioContext.close()
  }
}
