/**
 * @vitest-environment jsdom
 */
import React from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import '@testing-library/jest-dom'

import { PersonalView } from './PersonalView'

vi.mock('@/features/subscriptions/ui/AccountTypeSection/AccountTypeSection', () => ({
  AccountTypeSection: ({
    selectedType,
    onTypeChange,
    accountTypes,
  }: {
    selectedType: string
    onTypeChange?: (value: string) => void
    accountTypes?: Array<{ value: string; label: string }>
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'account-type-section' },
      React.createElement('span', { 'data-testid': 'selected-type' }, selectedType),
      ...(accountTypes?.map(t =>
        React.createElement(
          'button',
          {
            key: t.value,
            type: 'button',
            onClick: () => onTypeChange?.(t.value),
          },
          t.label
        )
      ) ?? [])
    ),
}))

describe('PersonalView', () => {
  it('renders AccountTypeSection', () => {
    render(
      React.createElement(PersonalView, {
        accountType: 'personal',
        onAccountTypeChange: vi.fn(),
      })
    )

    expect(screen.getByTestId('account-type-section')).toBeInTheDocument()
  })

  it('displays current account type', () => {
    render(
      React.createElement(PersonalView, {
        accountType: 'business',
        onAccountTypeChange: vi.fn(),
      })
    )

    expect(screen.getByTestId('selected-type')).toHaveTextContent('business')
  })

  it('calls onAccountTypeChange when type is selected', () => {
    const handleChange = vi.fn()

    render(
      React.createElement(PersonalView, {
        accountType: 'personal',
        onAccountTypeChange: handleChange,
      })
    )

    screen.getByText('Business').click()
    expect(handleChange).toHaveBeenCalledWith('business')
  })
})
