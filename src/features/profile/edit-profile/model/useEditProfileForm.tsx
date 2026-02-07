import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { EditProfileFormValues, editProfileSchema } from '../lib/editProfileFormValues'

export function useEditProfileForm(defaultValues?: EditProfileFormValues) {
  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: defaultValues ?? {
      userName: '',
      firstName: '',
      lastName: '',
      aboutMe: '',
      country: '',
      city: '',
      region: '',
      date_of_birth: undefined,
      detectLocation: undefined,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldUnregister: false,
  })

  const { handleSubmit, control, watch, formState, reset, setValue, ...rest } = form
  const { errors, isDirty, isValid, dirtyFields, submitCount } = formState

  return {
    handleSubmit,
    control,
    errors,
    watch,
    reset,
    isDirty,
    dirtyFields,
    isValid,
    setValue,
    submitCount,
    ...rest,
  }
}
