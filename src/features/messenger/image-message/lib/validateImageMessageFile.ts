export const MAX_IMAGE_MESSAGE_SIZE = 1024 * 1024

export const ALLOWED_IMAGE_TYPES: string[] = ['image/jpeg', 'image/png']

export type ImageValidationError = 'invalidType' | 'tooLarge' | 'processingFailed'

export function isAllowedImageMessageType(file: File) {
  return ALLOWED_IMAGE_TYPES.includes(file.type)
}
