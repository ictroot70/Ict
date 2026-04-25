/* @vitest-environment jsdom */
import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  PaymentConfirmationModal,
  PaymentFailureModal,
  PaymentProcessingModal,
  PaymentSuccessModal,
} from './index'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) =>
    (
      ({
        agree: 'I agree',
        ok: 'OK',
        backToPayment: 'Back to payment',
        autoRenewTitle: 'Auto renew',
        autoRenewText: 'Auto renew text',
        sending: 'Sending',
        successTitle: 'Success',
        successText: 'Success text',
        errorTitle: 'Error',
        errorText: 'Error text',
      }) as Record<string, string>
    )[key] ?? key,
}))

vi.mock('@/shared/ui', () => ({
  Modal: ({ open, children }: { children: React.ReactNode; open: boolean }) =>
    open ? React.createElement('div', null, children) : null,

  Typography: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),

  Button: ({
    children,
    disabled,
    onClick,
  }: {
    children: React.ReactNode
    disabled?: boolean
    onClick?: () => void
  }) => React.createElement('button', { type: 'button', disabled, onClick }, children),

  CheckboxRadix: ({
    checked,
    label,
    onCheckedChange,
  }: {
    checked: boolean
    label: string
    onCheckedChange: (value: boolean) => void
  }) =>
    React.createElement(
      'label',
      null,
      React.createElement('input', {
        'aria-label': label,
        checked,
        type: 'checkbox',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onCheckedChange(e.target.checked),
      }),
      label
    ),
}))

describe('PaymentModals (T6)', () => {
  it('Confirm modal: "I agree" toggles OK enabled/disabled', () => {
    const onConfirm = vi.fn()

    render(
      React.createElement(PaymentConfirmationModal, {
        open: true,
        onClose: vi.fn(),
        onConfirm,
        isSubmitting: false,
      })
    )

    const okButton = screen.getByRole('button', { name: 'OK' }) as HTMLButtonElement

    expect(okButton.disabled).toBe(true)

    fireEvent.click(screen.getByLabelText('I agree'))
    expect(okButton.disabled).toBe(false)
  })

  it('Success modal: clicking OK closes the modal', () => {
    const onClose = vi.fn()

    render(
      React.createElement(PaymentSuccessModal, {
        open: true,
        onClose,
      })
    )

    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Error modal: "Back to payment" triggers callback', () => {
    const onBackToPayment = vi.fn()

    render(
      React.createElement(PaymentFailureModal, {
        open: true,
        onClose: vi.fn(),
        onBackToPayment,
      })
    )

    fireEvent.click(screen.getByRole('button', { name: 'Back to payment' }))
    expect(onBackToPayment).toHaveBeenCalledTimes(1)
  })

  it('Processing modal: is shown while payment confirmation is pending', () => {
    render(
      React.createElement(PaymentProcessingModal, {
        open: true,
      })
    )

    expect(screen.getByText('Please wait while we confirm your payment.')).not.toBeNull()
    expect(screen.getByLabelText('Processing payment')).not.toBeNull()
  })
})
