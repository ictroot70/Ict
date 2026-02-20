type UploadErrorActionHint = 'retry' | 'back' | 'auth'

type UploadUserMessage = {
  action: UploadErrorActionHint
  userMessage: string
}

const MAX_FILES_PER_UPLOAD = 10
const FILE_CANNOT_BE_PROCESSED_MESSAGE = 'the file cannot be processed'
const FILES_TOO_LARGE_MESSAGE = 'the number of files is too large'
const FILE_SIZE_TOO_LARGE_MESSAGE = 'the file size is too large'
const FILE_FORMAT_INCORRECT_MESSAGE = 'the file format is incorrect'

const toMessageTexts = (error: unknown): string[] => {
  const texts: string[] = []

  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
      texts.push((error as { message: string }).message)
    }

    if ('error' in error && typeof (error as { error?: unknown }).error === 'string') {
      texts.push((error as { error: string }).error)
    }

    if ('data' in error) {
      const data = (error as { data?: unknown }).data

      if (typeof data === 'object' && data !== null && 'messages' in data) {
        const messages = (data as { messages?: unknown }).messages

        if (Array.isArray(messages)) {
          messages.forEach(item => {
            if (
              typeof item === 'object' &&
              item !== null &&
              'message' in item &&
              typeof (item as { message?: unknown }).message === 'string'
            ) {
              texts.push((item as { message: string }).message)
            }
          })
        }
      }
    }
  }

  return texts
}

const getErrorStatus = (error: unknown): number | null => {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return null
  }

  const status = (error as { status?: unknown }).status

  return typeof status === 'number' ? status : null
}

const isNetworkError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status

    if (typeof status === 'string' && status.toUpperCase() === 'FETCH_ERROR') {
      return true
    }
  }

  const messageText = toMessageTexts(error).join(' ').toLowerCase()

  return (
    messageText.includes('failed to fetch') ||
    messageText.includes('network') ||
    messageText.includes('fetch error') ||
    messageText.includes('timeout')
  )
}

export const toUploadUserMessage = (
  error: unknown,
  context?: { failedFileIndex?: number }
): UploadUserMessage => {
  const status = getErrorStatus(error)
  const messageTexts = toMessageTexts(error).map(text => text.toLowerCase())
  const containsMessage = (needle: string): boolean =>
    messageTexts.some(text => text.includes(needle))

  if (status === 401) {
    return {
      action: 'auth',
      userMessage: 'Сессия истекла. Обновите страницу и войдите снова.',
    }
  }

  if (containsMessage(FILE_CANNOT_BE_PROCESSED_MESSAGE)) {
    const withIndex =
      typeof context?.failedFileIndex === 'number'
        ? `Файл [${context.failedFileIndex}] не может быть обработан. Выберите другой файл.`
        : 'Один из файлов не может быть обработан. Выберите другой файл.'

    return {
      action: 'back',
      userMessage: withIndex,
    }
  }

  if (containsMessage(FILES_TOO_LARGE_MESSAGE)) {
    return {
      action: 'back',
      userMessage: `Можно загрузить не более ${MAX_FILES_PER_UPLOAD} файлов.`,
    }
  }

  if (containsMessage(FILE_SIZE_TOO_LARGE_MESSAGE)) {
    return {
      action: 'back',
      userMessage: 'Один из файлов превышает допустимый размер (10MB). Выберите другой файл.',
    }
  }

  if (containsMessage(FILE_FORMAT_INCORRECT_MESSAGE)) {
    return {
      action: 'back',
      userMessage: 'Неподдерживаемый формат файла. Используйте JPG, PNG или WEBP.',
    }
  }

  if (status === 429 || (typeof status === 'number' && status >= 500) || isNetworkError(error)) {
    return {
      action: 'retry',
      userMessage: 'Временная ошибка сети или сервера. Попробуйте ещё раз.',
    }
  }

  return {
    action: 'retry',
    userMessage:
      'Не удалось подготовить изображения. Попробуйте ещё раз или выберите другие файлы.',
  }
}

export type { UploadErrorActionHint }
