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
    open ? <div>{children}</div> : null,
  Typography: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Button: ({
    children,
    disabled,
    onClick,
  }: {
    children: React.ReactNode
    disabled?: boolean
    onClick?: () => void
  }) => (
    <button type={'button'} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
  CheckboxRadix: ({
    checked,
    label,
    onCheckedChange,
  }: {
    checked: boolean
    label: string
    onCheckedChange: (value: boolean) => void
  }) => (
    <label>
      <input
        aria-label={label}
        checked={checked}
        type={'checkbox'}
        onChange={e => onCheckedChange(e.target.checked)}
      />
      {label}
    </label>
  ),
}))

describe('PaymentModals (T6)', () => {
  it('Confirm modal: "I agree" toggles OK enabled/disabled', () => {
    const onConfirm = vi.fn()

    render(
      <PaymentConfirmationModal open onClose={vi.fn()} onConfirm={onConfirm} isSubmitting={false} />
    )

    const okButton = screen.getByRole('button', { name: 'OK' }) as HTMLButtonElement

    expect(okButton.disabled).toBe(true)

    fireEvent.click(screen.getByLabelText('I agree'))
    expect(okButton.disabled).toBe(false)
  })

  it('Success modal: clicking OK closes the modal', () => {
    const onClose = vi.fn()

    render(<PaymentSuccessModal open onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Error modal: "Back to payment" triggers callback', () => {
    const onBackToPayment = vi.fn()

    render(<PaymentFailureModal open onClose={vi.fn()} onBackToPayment={onBackToPayment} />)

    fireEvent.click(screen.getByRole('button', { name: 'Back to payment' }))
    expect(onBackToPayment).toHaveBeenCalledTimes(1)
  })

  it('Processing modal: is shown while payment confirmation is pending', () => {
    render(<PaymentProcessingModal open />)

    expect(screen.getByText('Please wait while we confirm your payment.')).not.toBeNull()
    expect(screen.getByLabelText('Processing payment')).not.toBeNull()
  })
})
