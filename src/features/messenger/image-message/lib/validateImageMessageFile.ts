export const MAX_IMAGE_MESSAGE_SIZE = 1024 * 1024

export const ALLOWED_IMAGE_TYPES: string[] = ['image/jpeg', 'image/png']

export type ImageValidationError = 'invalidType' | 'tooLarge'

export function isAllowedImageMessageType(file: File) {
  return ALLOWED_IMAGE_TYPES.includes(file.type)
}

export function isImageMessageWithinSizeLimit(file: File) {
  return file.size <= MAX_IMAGE_MESSAGE_SIZE
}

export function validateImageMessageFile(file: File): ImageValidationError | null {
  if (!isAllowedImageMessageType(file)) {
    return 'invalidType'
  }

  if (!isImageMessageWithinSizeLimit(file)) {
    return 'tooLarge'
  }

  return null
}
