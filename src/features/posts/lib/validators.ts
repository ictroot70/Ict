const MAX_FILE_SIZE_MB = 20
const ALLOWED_TYPES = ["image/jpeg", "image/png"]


export function validateFiles(files: File[]): string[] {
  const errors: string[] = []

  files.forEach((file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: Неверный формат. Только JPEG/PNG`)
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      errors.push(`${file.name}: Размер превышен ${MAX_FILE_SIZE_MB} MB`)
    }
  })
  return errors
}


export function validateDescription(desc: string): string | null {
  if (desc.length > 500) {
    return "Описание не должно превышать 500 символов";
  }
  return null;
}