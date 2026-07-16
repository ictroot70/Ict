/* @vitest-environment jsdom */

import React from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import '@testing-library/jest-dom'

import { SignInForm } from './SignInForm'

const mocks = vi.hoisted(() => ({
  signInState: {
    form: {
      control: {},
      formState: {
        errors: {},
        isDirty: true,
        isSubmitted: false,
        isValid: true,
        touchedFields: {},
      },
    },
    onSubmit: vi.fn(),
    isLoading: false,
  },
}))

vi.mock('react-hook-form', () => ({
  useWatch: () => '',
}))

vi.mock('@/features/auth', () => ({
  useSignIn: () => mocks.signInState,
}))

vi.mock('@/features/formControls', () => ({
  ControlledInput: ({
    disabled,
    label,
    name,
  }: {
    disabled?: boolean
    label: string
    name: string
  }) => <input aria-label={label} disabled={disabled} name={name} />,
}))

vi.mock('@/shared/composites', () => ({
  OAuthIcons: ({ disabled }: { disabled?: boolean }) => (
    <div>
      <button type={'button'} disabled={disabled}>
        Google
      </button>
      <button type={'button'} disabled={disabled}>
        GitHub
      </button>
    </div>
  ),
}))

vi.mock('@/shared/ui', () => ({
  Button: ({
    children,
    disabled,
    fullWidth: _fullWidth,
    variant: _variant,
  }: {
    children: React.ReactNode
    disabled?: boolean
    fullWidth?: boolean
    variant?: string
  }) => (
    <button disabled={disabled} type={'button'}>
      {children}
    </button>
  ),
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('SignInForm', () => {
  it('keeps form visible and disables submit controls during loading', () => {
    mocks.signInState = {
      ...mocks.signInState,
      isLoading: true,
    }

    render(<SignInForm router={{ replace: vi.fn() }} />)

    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Google' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeDisabled()
    expect(screen.queryByText('Sign In')).not.toBeNull()
  })
})
