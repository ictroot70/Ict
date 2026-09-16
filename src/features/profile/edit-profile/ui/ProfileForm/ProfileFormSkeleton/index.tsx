import { ThemeVariant, themeVariant, Skeleton } from '@/shared/composites'

import s from './ProfileFormSkeleton.module.scss'

import { InputSkeleton, SelectSkeleton, TextareaSkeleton } from './FieldsSkeleton'
export const ProfileFormSkeleton = ({
  variant = themeVariant.DEFAULT,
}: {
  variant?: ThemeVariant
}) => {
  return (
    <div className={s.container}>
      <div className={s.inputContainer}>
        <InputSkeleton variant={variant} />
        <InputSkeleton variant={variant} />
        <InputSkeleton variant={variant} />
      </div>

      <div className={s.dateOfBirth}>
        <InputSkeleton variant={variant} />
      </div>

      <div className={s.location}>
        <SelectSkeleton variant={variant} />
        <SelectSkeleton variant={variant} />
      </div>

      <div className={s.location_myPosition}>
        <Skeleton variant={variant} className={s.locationMyPositionSkeleton} />
      </div>

      <div className={s.aboutMe}>
        <TextareaSkeleton variant={variant} />
      </div>

      <div className={s.separator}>
        <Skeleton variant={variant} className={s.separatorSkeleton} />
      </div>

      <div className={s.saveButton}>
        <Skeleton variant={variant} className={s.saveButtonSkeleton} />
      </div>
    </div>
  )
}
