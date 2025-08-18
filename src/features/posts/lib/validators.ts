const MAX_FILE_SIZE_MB = 20
const ALLOWED_TYPES = ["image/jpeg", "image/png"]
const MAX_FILES = 10


export function validateFiles(files: File[], existingCount = 0): string[] {
  const errors: string[] = []

  if (files.length + existingCount > MAX_FILES) {
    errors.push(`Можно загрузить не более ${MAX_FILES} файлов`)
  }

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