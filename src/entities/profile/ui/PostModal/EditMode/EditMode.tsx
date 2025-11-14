import { useForm } from 'react-hook-form'
import { Button, Typography } from '@/shared/ui'
import s from './EditMode.module.scss'
import Image from 'next/image'
import { Avatar } from '@/shared/composites'
import Carousel from '@/entities/users/ui/public/PublicPost/Carousel/Carousel'
import { ControlledTextarea } from '@/features/formControls/textarea/ui'
import { useState, useEffect, useCallback } from 'react'

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

  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [initialDescription, setInitialDescription] = useState(effectiveDescription)

  useEffect(() => {
    const hasChanges = descriptionValue !== initialDescription
    setHasUnsavedChanges(hasChanges)
  }, [descriptionValue, initialDescription])

  const attemptClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true)
    } else {
      handleCancelEdit()
    }
  }, [hasUnsavedChanges, handleCancelEdit])

  const handleConfirmExit = () => {
    setShowExitConfirm(false)
    handleCancelEdit()
  }

  const handleCancelExit = () => {
    setShowExitConfirm(false)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      attemptClose()
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        attemptClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [attemptClose])

  const handleFormSubmit = async (data: EditDescriptionForm) => {
    await handleSaveDescription(data)
    setHasUnsavedChanges(false)
  }

  return (
    <>
      <div className={s.modalOverlay} onClick={handleOverlayClick}>
        <div className={s.editMode} onClick={(e) => e.stopPropagation()}>
          <div className={s.editHeader}>
            <Typography variant="h1" className={s.editTitle}>
              Edit Post
            </Typography>
            <Button
              variant="text"
              onClick={attemptClose}
              className={s.closeButton}
            >
              ✕
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
                <Image
                  src={effectiveImages[0]?.url}
                  alt={'Post image'}
                  fill
                  className={s.editImage}
                />
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

                <form onSubmit={handleDescriptionSubmit(handleFormSubmit)} className={s.editDescriptionForm}>
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
                      onClick={attemptClose}
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
      </div>

      {showExitConfirm && (
        <div className={s.exitConfirmationOverlay} onClick={(e) => e.stopPropagation()}>
          <div className={s.exitConfirmationDialog}>
            <div className={s.exitConfirmationHeader}>
              <Typography variant="h3">Close Post</Typography>
              <Button
                variant="text"
                onClick={handleCancelExit}
                className={s.exitCloseButton}
              >
                ✕
              </Button>
            </div>

            <div className={s.exitConfirmationContent}>
              <Typography variant="regular_14">
                Do you really want to close the edition of the publication? If you close changes won’t be saved
              </Typography>
            </div>

            <div className={s.exitConfirmationActions}>
              <Button
                variant="outlined"
                onClick={handleCancelExit}
                className={s.exitCancelButton}
              >
                No
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmExit}
                className={s.exitConfirmButton}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}