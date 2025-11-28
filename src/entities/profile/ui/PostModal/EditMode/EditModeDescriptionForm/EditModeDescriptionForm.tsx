// components/DescriptionForm.tsx
import { Button, Typography } from '@/shared/ui'
import { Avatar } from '@/shared/composites'
import { ControlledTextarea } from '@/features/formControls/textarea/ui'
import { PostModalData } from '@/shared/types'
import s from '../EditMode.module.scss'

interface DescriptionFormProps {
  postData: PostModalData
  control: any
  handleSubmit: any
  errors: any
  watchDescription: (field: string) => string
  characterCount: number
  maxCharacters: number
  shouldDisableSave: boolean
  isEditing: boolean
  onSubmit: (data: { description: string }) => void
}

export const EditModeDescriptionForm: React.FC<DescriptionFormProps> = ({
  postData,
  control,
  handleSubmit,
  errors,
  watchDescription,
  characterCount,
  maxCharacters,
  shouldDisableSave,
  isEditing,
  onSubmit,
}) => {
  return (
    <div className={s.editFormContainer}>
      <div className={s.userInfo}>
        <Avatar size={36} image={postData.avatar} />
        <Typography variant="h3" color="light">
          {postData.userName}
        </Typography>
      </div>

      <div className={s.editFormSection}>
        <Typography variant="regular_14" className={s.formLabel}>
          Add publication descriptions
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} className={s.editDescriptionForm}>
          <ControlledTextarea
            name="description"
            control={control}
            placeholder="Write your description here..."
            className={s.descriptionTextarea}
            rules={{
              maxLength: {
                value: maxCharacters,
                message: `Description must be less than ${maxCharacters} characters`,
              },
            }}
          />

          <div className={s.characterCounter}>
            <Typography
              variant="small_text"
              className={characterCount > maxCharacters ? s.characterError : s.characterInfo}
            >
              {characterCount}/{maxCharacters}
            </Typography>
          </div>

          {errors.description && (
            <Typography variant="small_text" className={s.errorMessage}>
              {errors.description.message}
            </Typography>
          )}

          {isEditing && (
            <div className={s.editDescriptionActions}>
              <Button
                variant="primary"
                type="submit"
                disabled={shouldDisableSave}
                className={s.saveEditButton}
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
