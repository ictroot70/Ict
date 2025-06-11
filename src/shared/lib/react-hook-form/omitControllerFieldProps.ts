import { useController } from 'react-hook-form'

export type OmitControllerFieldProps<T> = Omit<T, keyof ReturnType<typeof useController>['field']>
