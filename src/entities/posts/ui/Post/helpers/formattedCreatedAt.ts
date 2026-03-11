function formattedCreatedAt(data: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(data))
}

export { formattedCreatedAt }
