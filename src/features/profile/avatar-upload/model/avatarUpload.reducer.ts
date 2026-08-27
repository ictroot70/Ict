import { UnknownAction } from '@reduxjs/toolkit'

import { State, Action } from './types'

const avatarActionTypes = {
  OPEN_MODAL: true,
  OPEN_DELETE_MODAL: true,
  CLOSE_DELETE_MODAL: true,
  CONFIRM_DELETE: true,
  RESET: true,
  SET_FILE: true,
  SET_ZOOM: true,
  SET_CROPPED_PREVIEW: true,
  SET_ERROR: true,
  CLEAR_ERROR: true,
  SUBMIT_START: true,
  SUBMIT_SUCCESS: true,
  SUBMIT_ERROR: true,
} as const

function isAvatarAction(action: UnknownAction): action is Action {
  return (
    typeof action.type === 'string' &&
    Object.prototype.hasOwnProperty.call(avatarActionTypes, action.type)
  )
}

export function getInitialState(): State {
  return {
    step: 'upload',
    file: null,
    previewUrl: null,
    croppedPreview: null,
    zoom: 1,
    error: null,
    isModalOpen: false,
    isDeleteModalOpen: false,
    isSubmitting: false,
  }
}

export const initialState: State = getInitialState()

export function reducer(state: State = initialState, action: UnknownAction): State {
  if (!isAvatarAction(action)) {
    return state
  }

  switch (action.type) {
    case 'OPEN_MODAL':
      return { ...state, isModalOpen: true, error: null, step: 'upload' }

    case 'SET_FILE':
      return {
        ...state,
        file: action.file,
        previewUrl: action.previewUrl,
        step: 'crop',
        error: null,
        isModalOpen: true,
      }

    case 'OPEN_DELETE_MODAL':
      return { ...state, isDeleteModalOpen: true }

    case 'CLOSE_DELETE_MODAL':
      return { ...state, isDeleteModalOpen: false }

    case 'CONFIRM_DELETE':
      return { ...state, isDeleteModalOpen: false, isSubmitting: false }

    case 'RESET':
      return getInitialState()

    case 'SET_ZOOM':
      return { ...state, zoom: action.value }

    case 'SET_CROPPED_PREVIEW':
      return { ...state, croppedPreview: action.value }

    case 'SET_ERROR':
      return { ...state, error: action.value }

    case 'CLEAR_ERROR':
      return { ...state, error: null }

    case 'SUBMIT_START':
      return { ...state, isSubmitting: true }

    case 'SUBMIT_SUCCESS':
      return getInitialState()

    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, error: action.error }

    default:
      return state
  }
}

export const avatarUploadReducer = reducer
