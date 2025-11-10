import { useForm } from 'react-hook-form'
import { Button, Typography } from '@/shared/ui'
import s from '../PostModal.module.scss'
import Image from 'next/image'
import { Avatar } from '@/shared/composites'
import Carousel from '@/entities/users/ui/public/PublicPost/Carousel/Carousel'
import { ControlledTextarea } from '@/features/formControls/textarea/ui'
import { CloseIcon } from '@ictroot/ui-kit'

type EditDescriptionForm = { description: string }

type Props = {
  descriptionControl: any
  handleDescriptionSubmit: any
  handleSaveDescription: (data: EditDescriptionForm) => void
  handleCancelEdit: () => void
  errors: any
  watchDescription: (field: string) => string
  effectiveImages: { url: string }[]
  effectiveAvatar: string
  effectiveUserName: string
  effectiveDescription: string
  onClose: () => void
}

export const EditMode = ({
  descriptionControl,
  handleDescriptionSubmit,
  handleSaveDescription,
  handleCancelEdit,
  errors,
  watchDescription,
  effectiveImages,
  effectiveAvatar,
  effectiveUserName,
  effectiveDescription,
  onClose
}: Props) => {
  const descriptionValue = watchDescription('description') || ''
  const characterCount = descriptionValue.length
  const maxCharacters = 500

  return (
    <div className={s.editMode}>
      <div className={s.editHeader}>
        <Typography variant="h1" className={s.editTitle}>
          Edit Post
        </Typography>
        <Button
          variant="text"
          onClick={handleCancelEdit}
          className={s.closeButton}
        >
          {/* <CloseIcon /> */}
        </Button>
      </div>

      <div className={s.editContent}>
        <div className={s.editImageContainer}>
          {effectiveImages.length > 1 ? (
            <Carousel
              slides={effectiveImages}
              options={{
                align: 'center',
                loop: false,
              }}
            />
          ) : effectiveImages.length === 1 ? (
            <Image src={effectiveImages[0]?.url} alt={'Post image'} fill className={s.editImage} />
          ) : null}
        </div>

        <div className={s.editFormContainer}>
          <div className={s.userInfo}>
            <Avatar size={36} image={effectiveAvatar} />
            <Typography variant={'h3'} color={'light'}>
              {effectiveUserName}
            </Typography>
          </div>

          <div className={s.editFormSection}>
            <Typography variant="regular_14" className={s.formLabel}>
              Add publication descriptions
            </Typography>

            <form onSubmit={handleDescriptionSubmit(handleSaveDescription)} className={s.editDescriptionForm}>
              <ControlledTextarea<EditDescriptionForm>
                name={'description'}
                control={descriptionControl}
                placeholder={'Write your description here...'}
                className={s.descriptionTextarea}
                rules={{
                  maxLength: {
                    value: maxCharacters,
                    message: `Description must be less than ${maxCharacters} characters`
                  }
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

              <div className={s.editDescriptionActions}>
                <Button
                  variant={'outlined'}
                  type="button"
                  onClick={handleCancelEdit}
                  className={s.cancelEditButton}
                >
                  Cancel
                </Button>
                <Button
                  variant={'primary'}
                  type={'submit'}
                  disabled={!descriptionValue.trim() || characterCount > maxCharacters}
                  className={s.saveEditButton}
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}