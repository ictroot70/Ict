import { Path, type FieldValues } from 'react-hook-form'

export type InputField<T extends FieldValues> = {
  type: 'input'
  name: Path<T>
  label: string
  required?: boolean
  inputType?: 'text' | 'hide-able' | 'search'
  placeholder?: string
}

export type DateField<T extends FieldValues> = {
  type: 'date'
  name: Path<T>
  label: string
}

export type SelectField<T extends FieldValues> = {
  type: 'select'
  name: Path<T>
  label: string
  // options: { value: string; label?: string }[]
  placeholder?: string
}

export type TextareaField<T extends FieldValues> = {
  type: 'textarea'
  name: Path<T>
  label: string
  placeholder?: string
}

export type LocationField<T extends FieldValues> = {
  type: 'location'
  name: Path<T>
  label: string
}

export type Field<T extends FieldValues> =
  | InputField<T>
  | DateField<T>
  | SelectField<T>
  | LocationField<T>
  | TextareaField<T>
