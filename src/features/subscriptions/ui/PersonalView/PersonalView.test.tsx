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
  }) => (
    <div data-testid={'account-type-section'}>
      <span data-testid={'selected-type'}>{selectedType}</span>
      {accountTypes?.map(t => (
        <button key={t.value} type={'button'} onClick={() => onTypeChange?.(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  ),
}))

describe('PersonalView', () => {
  it('renders AccountTypeSection', () => {
    render(<PersonalView accountType={'personal'} onAccountTypeChange={vi.fn()} />)
    expect(screen.getByTestId('account-type-section')).toBeInTheDocument()
  })

  it('displays current account type', () => {
    render(<PersonalView accountType={'business'} onAccountTypeChange={vi.fn()} />)
    expect(screen.getByTestId('selected-type')).toHaveTextContent('business')
  })

  it('calls onAccountTypeChange when type is selected', () => {
    const handleChange = vi.fn()

    render(<PersonalView accountType={'personal'} onAccountTypeChange={handleChange} />)
    screen.getByText('Business').click()
    expect(handleChange).toHaveBeenCalledWith('business')
  })
})
