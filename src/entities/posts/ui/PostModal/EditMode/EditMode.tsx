import React, { useState, useEffect, useCallback } from 'react'
import { Control, FieldErrors, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { PostViewModel } from '@/entities/posts/api'
import { DescriptionFormData } from '@/shared/types'

import s from './EditMode.module.scss'

import { EditModeDescriptionForm } from './EditModeDescriptionForm/EditModeDescriptionForm'
import { EditModeHeader } from './EditModeHeader/EditModeHeader'
import { EditModeImageSection } from './EditModeImageSection/EditModeImageSection'
import { ExitConfirmationModal } from './ExitConfirmationModal/ExitConfirmationModal'

interface EditModeProps {
  description: {
    control: Control<DescriptionFormData>
    errors: FieldErrors<DescriptionFormData>
    handleCancel: () => void
    handleSubmit: UseFormHandleSubmit<DescriptionFormData>
    watch: UseFormWatch<DescriptionFormData>
  }
  handleSaveDescription: (data: DescriptionFormData) => void
  postData: PostViewModel
  isEditing?: boolean
}

export const EditMode = ({
  description,
  handleSaveDescription,
  postData,
  isEditing = false,
}: EditModeProps) => {
  const descriptionValue = description.watch('description') || ''
  const characterCount = descriptionValue.length
  const maxCharacters = 500

  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    setHasUnsavedChanges(descriptionValue !== postData.description)
  }, [descriptionValue, postData.description])

  const attemptClose = useCallback(() => {
    hasUnsavedChanges ? setShowExitConfirm(true) : description.handleCancel()
  }, [description, hasUnsavedChanges])

  const handleConfirmExit = () => {
    setShowExitConfirm(false)
    description.handleCancel()
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

    return () => document.removeEventListener('keydown', handleEscape)
  }, [attemptClose])

  const handleFormSubmit = async (data: DescriptionFormData) => {
    await handleSaveDescription(data)
    setHasUnsavedChanges(false)
  }

  const shouldDisableSave = !descriptionValue.trim() || characterCount > maxCharacters

  return (
    <>
      <div className={s.modalOverlay} onClick={handleOverlayClick}>
        <div className={s.editMode} onClick={e => e.stopPropagation()}>
          <EditModeHeader
            isEditing={isEditing}
            title={'Edit Post'}
            onClose={attemptClose}
            onSave={description.handleSubmit(handleFormSubmit)}
            isSaveDisabled={shouldDisableSave}
            saveButtonText={'Save'}
          />

          <div className={s.editContent}>
            <EditModeImageSection postData={postData} />

            <EditModeDescriptionForm
              postData={postData}
              control={description.control}
              handleSubmit={description.handleSubmit}
              errors={description.errors}
              characterCount={characterCount}
              maxCharacters={maxCharacters}
              shouldDisableSave={shouldDisableSave}
              isEditing={isEditing}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      </div>

      <ExitConfirmationModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={handleConfirmExit}
      />
    </>
  )
}
