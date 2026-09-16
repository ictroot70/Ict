const MAX_IMAGE_MESSAGE_SIZE = 1024 * 1024

const ALLOWED_IMAGE_TYPES: string[] = ['image/jpeg', 'image/png']

export type ImageValidationError = 'invalidType' | 'tooLarge'

export function validateImageMessageFile(file: File): ImageValidationError | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'invalidType'
  }

  if (file.size > MAX_IMAGE_MESSAGE_SIZE) {
    return 'tooLarge'
  }

  return null
}
