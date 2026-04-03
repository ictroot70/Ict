/* @vitest-environment jsdom */
import React from 'react'

import { AccountTypeValue } from '@/features/profile/settings/model/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import '@testing-library/jest-dom'

import { PersonalView } from './PersonalView'

// ─── Мок react-i18next ─────────────────────────────────────
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'account.personal': 'Personal',
        'account.business': 'Business',
        'personal.title': 'Personal Account',
        'personal.description': 'You are currently using a free Personal account',
      })[key] ?? key,
  }),
}))

// ─── Мок UI-компонентов ────────────────────────────────────
vi.mock('@/shared/ui', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid={'card'}>
      {children}
    </div>
  ),
  Typography: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-variant={variant}>{children}</span>
  ),
}))

// ─── Мок AccountTypeSection ────────────────────────────────
vi.mock(
  '@/features/profile/settings/ui/AccountManagement/AccountTypeSection/AccountTypeSection',
  () => ({
    AccountTypeSection: ({
      accountTypes,
      selectedType,
      onTypeChange,
    }: {
      accountTypes: { value: string; label: string }[]
      selectedType: string
      onTypeChange: (value: string) => void
    }) => (
      <div data-testid={'account-type-section'}>
        {accountTypes.map(type => (
          <label key={type.value}>
            <input
              type={'radio'}
              name={'accountType'}
              value={type.value}
              checked={selectedType === type.value}
              onChange={() => onTypeChange(type.value)}
              aria-label={type.label}
              data-testid={`radio-${type.value}`}
            />
            <span>{type.label}</span>
          </label>
        ))}
      </div>
    ),
  })
)

// ─── Тесты ─────────────────────────────────────────────────
describe('PersonalView', () => {
  const defaultProps = {
    accountType: 'personal' as AccountTypeValue,
    onAccountTypeChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders personal account info', () => {
    render(<PersonalView {...defaultProps} />)

    expect(screen.getByText('Personal Account')).toBeInTheDocument()
    expect(screen.getByText(/free Personal account/)).toBeInTheDocument()
  })

  it('renders AccountTypeSection with correct options', () => {
    render(<PersonalView {...defaultProps} />)

    expect(screen.getByTestId('account-type-section')).toBeInTheDocument()
    expect(screen.getByLabelText('Personal')).toBeInTheDocument()
    expect(screen.getByLabelText('Business')).toBeInTheDocument()
  })

  it('calls onAccountTypeChange when switching to business', async () => {
    const user = userEvent.setup()

    render(<PersonalView {...defaultProps} />)

    await user.click(screen.getByLabelText('Business'))
    expect(defaultProps.onAccountTypeChange).toHaveBeenCalledWith('business')
  })

  it('has Personal radio checked by default', () => {
    render(<PersonalView {...defaultProps} />)

    const personalRadio = screen.getByTestId('radio-personal') as HTMLInputElement

    expect(personalRadio.checked).toBe(true)
  })
})
