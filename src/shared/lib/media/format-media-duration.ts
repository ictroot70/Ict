export function formatMediaDuration(value: number, padMinutes = false): string {
  const totalSeconds = Math.max(0, Math.floor(value))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const formattedMinutes = padMinutes ? minutes.toString().padStart(2, '0') : minutes.toString()

  return `${formattedMinutes}:${seconds.toString().padStart(2, '0')}`
}
