import { Button, Typography } from '@/shared/ui'
import s from './EditMode.module.scss'
import Image from 'next/image'
import { Avatar } from '@/shared/composites'
import Carousel from '@/entities/users/ui/public/PublicPost/Carousel/Carousel'
import { ControlledTextarea } from '@/features/formControls/textarea/ui'
import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/features/posts/ui/Header/header'
import { PostModalData } from '@/shared/types'

interface EditModeProps {
  descriptionControl: any
  handleDescriptionSubmit: any
  handleSaveDescription: (data: { description: string }) => void
  handleCancelEdit: () => void
  errors: any
  watchDescription: (field: string) => string
  postData: PostModalData
  onClose: () => void
  isEditing?: boolean
}

export const EditMode = ({
  descriptionControl,
  handleDescriptionSubmit,
  handleSaveDescription,
  handleCancelEdit,
  errors,
  watchDescription,
  postData,
  onClose,
  isEditing = false
}: EditModeProps) => {
  const descriptionValue = watchDescription('description') || ''
  const characterCount = descriptionValue.length
  const maxCharacters = 500

  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    setHasUnsavedChanges(descriptionValue !== postData.description)
  }, [descriptionValue, postData.description])

  const attemptClose = useCallback(() => {
    hasUnsavedChanges ? setShowExitConfirm(true) : handleCancelEdit()
  }, [hasUnsavedChanges, handleCancelEdit])

  const handleConfirmExit = () => {
    setShowExitConfirm(false)
    handleCancelEdit()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) attemptClose()
  }

  // Escape handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        attemptClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [attemptClose])

  const handleFormSubmit = async (data: { description: string }) => {
    await handleSaveDescription(data)
    setHasUnsavedChanges(false)
  }

  const shouldDisableSave = !descriptionValue.trim() || characterCount > maxCharacters

  return (
    <>
      <div className={s.modalOverlay} onClick={handleOverlayClick}>
        <div className={s.editMode} onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <div className={s.editHeader}>
              <Typography variant="h1" className={s.editTitle}>
                Edit Post
              </Typography>
              <Button variant="text" onClick={attemptClose} className={s.closeButton}>
                ✕
              </Button>
            </div>
          ) : (
            <Header
              onPrev={attemptClose}
              onNext={handleDescriptionSubmit(handleFormSubmit)}
              title="Edit Post"
              nextStepTitle="Save"
              disabledNext={shouldDisableSave}
            />
          )}

          <div className={s.editContent}>
            <div className={s.editImageContainer}>
              {postData.images.length > 1 ? (
                <Carousel
                  slides={postData.images}
                  options={{ align: 'center', loop: false }}
                />
              ) : postData.images.length === 1 ? (
                <Image
                  src={postData.images[0].url}
                  alt="Post image"
                  fill
                  className={s.editImage}
                />
              ) : null}
            </div>

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

                <form onSubmit={handleDescriptionSubmit(handleFormSubmit)} className={s.editDescriptionForm}>
                  <ControlledTextarea
                    name="description"
                    control={descriptionControl}
                    placeholder="Write your description here..."
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
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className={s.exitConfirmationOverlay} onClick={(e) => e.stopPropagation()}>
          <div className={s.exitConfirmationDialog}>
            <div className={s.exitConfirmationHeader}>
              <Typography variant="h3">Close Post</Typography>
              <Button variant="text" onClick={() => setShowExitConfirm(false)} className={s.exitCloseButton}>
                ✕
              </Button>
            </div>

            <div className={s.exitConfirmationContent}>
              <Typography variant="regular_14">
                Do you really want to close the edition of the publication? If you close changes won't be saved
              </Typography>
            </div>

            <div className={s.exitConfirmationActions}>
              <Button variant="outlined" onClick={() => setShowExitConfirm(false)} className={s.exitCancelButton}>
                No
              </Button>
              <Button variant="primary" onClick={handleConfirmExit} className={s.exitConfirmButton}>
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}