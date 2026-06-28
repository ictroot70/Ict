export const formatLikesCount = (count: number): string => {
  if (count === 1) {
    return '1 like'
  }

  return `${count.toLocaleString()} likes`
}
