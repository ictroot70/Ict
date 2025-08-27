function useTimeAgo(date: Date | string | number): string {
  const now = new Date()
  const targetDate = date instanceof Date ? date : new Date(date)
  const seconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  let interval = seconds / 31536000 // years
  if (interval > 1) return Math.floor(interval) + ' years ago'
  interval = seconds / 2592000 // months
  if (interval > 1) return Math.floor(interval) + ' months ago'
  interval = seconds / 86400 // days
  if (interval > 1) return Math.floor(interval) + ' days ago'
  interval = seconds / 3600 // hours
  if (interval > 1) return Math.floor(interval) + ' hours ago'
  interval = seconds / 60 // minutes
  if (interval > 1) return Math.floor(interval) + ' minutes ago'
  return Math.floor(seconds) + ' seconds ago'
}
