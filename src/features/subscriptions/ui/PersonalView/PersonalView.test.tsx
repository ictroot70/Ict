/* @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PersonalView } from './PersonalView'

vi.mock('@/features/subscriptions/ui/AccountTypeSection/AccountTypeSection', () => ({
  AccountTypeSection: ({ selectedType, onTypeChange, accountTypes }: any) => (
    <div data-testid="account-type-section">
      <span data-testid="selected-type">{selectedType}</span>
      {accountTypes?.map((t: any) => (
        <button key={t.value} onClick={() => onTypeChange?.(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  ),
}))

describe('PersonalView', () => {
  it('renders AccountTypeSection', () => {
    render(<PersonalView accountType="personal" onAccountTypeChange={vi.fn()} />)
    expect(screen.getByTestId('account-type-section')).not.toBeNull()
  })

  it('displays current account type', () => {
    render(<PersonalView accountType="business" onAccountTypeChange={vi.fn()} />)
    expect(screen.getByTestId('selected-type')).toHaveTextContent('business')
  })

  it('calls onAccountTypeChange when type is selected', () => {
    const handleChange = vi.fn()
    render(<PersonalView accountType="personal" onAccountTypeChange={handleChange} />)
    screen.getByText('Business').click()
    expect(handleChange).toHaveBeenCalledWith('business')
  })
})