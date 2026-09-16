const DAY_MS = 24 * 60 * 60 * 1000

const timeFormatter = new Intl.DateTimeFormat('en', {
  hour: '2-digit',
  minute: '2-digit',
})

const dateFormatter = new Intl.DateTimeFormat('en', {
  day: '2-digit',
  month: 'short',
})

export const formatTime = (value: string | null) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? '' : timeFormatter.format(date)
}

/** Time for today, date label when activity is older than 24 hours. */
export const formatDialogueActivity = (value: string | null) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const ageMs = Date.now() - date.getTime()

  if (ageMs >= DAY_MS) {
    return dateFormatter.format(date)
  }

  return timeFormatter.format(date)
}
