/* @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

import { SubscriptionPricing } from './SubscriptionPricing'
import { SubscriptionPlanValue } from '@/features/profile/settings/model/types'

// ─── Типы для моков (чтобы избежать ошибок импорта реальных типов) ──────
interface MockSubscriptionPlan {
  id: string
  value: SubscriptionPlanValue
  label: string
  price: string
  period: string
}

// ─── Моки UI-компонентов ─────────────────────────────────────
vi.mock('@/shared/ui', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  Typography: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-variant={variant}>{children}</span>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    className,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
    className?: string
  }) => (
    <button
      data-testid={`button-${variant || 'default'}`}
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}))

// ── Данные для тестов (ТОЛЬКО ДОПУСТИМЫЕ ЗНАЧЕНИЯ) ────────
// Используем 'month' и '7day', так как 'year' отсутствует в типе SubscriptionPlanValue
const mockPlans: MockSubscriptionPlan[] = [
  { id: '1', value: 'month', label: 'Monthly', price: '10', period: 'month' },
  { id: '2', value: '7day', label: 'Weekly', price: '5', period: 'week' },
]

describe('SubscriptionPricing', () => {
  const defaultProps = {
    plans: mockPlans as any, // Приводим к any для совместимости с пропсами компонента внутри теста
    selectedPlan: 'month' as SubscriptionPlanValue,
    onPlanChange: vi.fn(),
    onPayPalClick: vi.fn(),
    onStripeClick: vi.fn(),
    isPaymentLocked: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Базовый рендеринг ─────────────────────────────────────
  it('рендерит заголовок и список тарифов', () => {
    render(<SubscriptionPricing {...defaultProps} />)

    expect(screen.getByText(/Change your subscription/)).toBeInTheDocument()
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Weekly')).toBeInTheDocument() // Было Yearly -> стало Weekly
  })

  it('показывает заглушку, если массив планов пуст', () => {
    render(<SubscriptionPricing {...defaultProps} plans={[]} />)

    expect(screen.getByText('Нет доступных тарифов')).toBeInTheDocument()
    expect(screen.queryByText('Monthly')).not.toBeInTheDocument()
    expect(screen.queryByTestId('button-outlined')).not.toBeInTheDocument()
  })

  // ─── Логика выбора тарифа (Controlled Mode) ────────────────
  it('выделяет выбранный тариф (controlled mode)', () => {
    // Тестируем выбор второго тарифа ('7day')
    render(<SubscriptionPricing {...defaultProps} selectedPlan="7day" />)

    const weeklyRow = screen.getByText('Weekly').closest('[role="button"]')
    expect(weeklyRow).toHaveClass(expect.stringContaining('planRowSelected'))

    const monthlyRow = screen.getByText('Monthly').closest('[role="button"]')
    expect(monthlyRow).not.toHaveClass(expect.stringContaining('planRowSelected'))
  })

  it('вызывает onPlanChange при клике на другой тариф', async () => {
    const user = userEvent.setup()
    render(<SubscriptionPricing {...defaultProps} />)

    const weeklyRow = screen.getByText('Weekly').closest('[role="button"]')
    if (weeklyRow) {
      await user.click(weeklyRow)
      expect(defaultProps.onPlanChange).toHaveBeenCalledWith('7day') // Было 'year' -> стало '7day'
    }
  })

  it('поддерживает выбор тарифа с клавиатуры (Enter)', async () => {
    const user = userEvent.setup()
    render(<SubscriptionPricing {...defaultProps} />)

    const weeklyRow = screen.getByText('Weekly').closest('[role="button"]')
    if (weeklyRow) {
      // ИСПРАВЛЕНИЕ: Явное приведение к HTMLElement для метода focus()
      (weeklyRow as HTMLElement).focus()
      await user.keyboard('{Enter}')
      expect(defaultProps.onPlanChange).toHaveBeenCalledWith('7day')
    }
  })

  it('поддерживает выбор тарифа с клавиатуры (Space)', async () => {
    const user = userEvent.setup()
    render(<SubscriptionPricing {...defaultProps} />)

    const weeklyRow = screen.getByText('Weekly').closest('[role="button"]')
    if (weeklyRow) {
      // ИСПРАВЛЕНИЕ: Явное приведение к HTMLElement
      (weeklyRow as HTMLElement).focus()
      await user.keyboard(' ')
      expect(defaultProps.onPlanChange).toHaveBeenCalledWith('7day')
    }
  })

  // ─── Логика выбора тарифа (Uncontrolled Mode) ─────────────
  it('управляет состоянием локально, если onPlanChange не передан', async () => {
    const user = userEvent.setup()

    render(
      <SubscriptionPricing
        plans={mockPlans as any}
        onPayPalClick={vi.fn()}
        onStripeClick={vi.fn()}
      // onPlanChange не передаем
      />
    )

    // По умолчанию должен быть выбран первый ('month')
    expect(screen.getByText('Monthly').closest('[role="button"]')).toHaveClass(
      expect.stringContaining('planRowSelected')
    )

    const weeklyRow = screen.getByText('Weekly').closest('[role="button"]')
    if (weeklyRow) {
      await user.click(weeklyRow)

      // Теперь должен быть выбран '7day'
      expect(screen.getByText('Weekly').closest('[role="button"]')).toHaveClass(
        expect.stringContaining('planRowSelected')
      )
      expect(screen.getByText('Monthly').closest('[role="button"]')).not.toHaveClass(
        expect.stringContaining('planRowSelected')
      )
    }
  })

  it('синхронизирует внутреннее состояние при изменении external selectedPlan', () => {
    const { rerender } = render(
      <SubscriptionPricing {...defaultProps} selectedPlan="month" />
    )

    expect(screen.getByText('Monthly').closest('[role="button"]')).toHaveClass(
      expect.stringContaining('planRowSelected')
    )

    // Меняем пропс извне на '7day'
    rerender(<SubscriptionPricing {...defaultProps} selectedPlan="7day" />)

    expect(screen.getByText('Weekly').closest('[role="button"]')).toHaveClass(
      expect.stringContaining('planRowSelected')
    )
  })

  // ─── Кнопки оплаты ────────────────────────────────────────
  it('кнопки оплаты активны по умолчанию', () => {
    render(<SubscriptionPricing {...defaultProps} />)

    const buttons = screen.getAllByTestId('button-outlined')
    expect(buttons[0]).not.toBeDisabled()
    expect(buttons[1]).not.toBeDisabled()
  })

  it('кнопки оплаты заблокированы, если isPaymentLocked=true', () => {
    render(<SubscriptionPricing {...defaultProps} isPaymentLocked />)

    const buttons = screen.getAllByTestId('button-outlined')
    expect(buttons[0]).toBeDisabled()
    expect(buttons[1]).toBeDisabled()
  })

  it('кнопки оплаты заблокированы, если нет планов', () => {
    render(<SubscriptionPricing {...defaultProps} plans={[]} />)

    expect(screen.queryByTestId('button-outlined')).not.toBeInTheDocument()
  })

  it('кнопки оплаты заблокированы, если выбранный план не найден в списке', () => {
    render(
      <SubscriptionPricing
        {...defaultProps}
        selectedPlan={'nonexistent' as SubscriptionPlanValue}
      />
    )

    const buttons = screen.getAllByTestId('button-outlined')
    expect(buttons[0]).toBeDisabled()
    expect(buttons[1]).toBeDisabled()
  })

  it('вызывает onPayPalClick при клике на PayPal', async () => {
    const user = userEvent.setup()
    render(<SubscriptionPricing {...defaultProps} />)

    const buttons = screen.getAllByTestId('button-outlined')
    await user.click(buttons[0])

    expect(defaultProps.onPayPalClick).toHaveBeenCalledTimes(1)
  })

  it('вызывает onStripeClick при клике на Stripe', async () => {
    const user = userEvent.setup()
    render(<SubscriptionPricing {...defaultProps} />)

    const buttons = screen.getAllByTestId('button-outlined')
    await user.click(buttons[1])

    expect(defaultProps.onStripeClick).toHaveBeenCalledTimes(1)
  })
})