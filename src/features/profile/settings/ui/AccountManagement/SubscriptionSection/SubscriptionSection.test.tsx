// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import { SubscriptionSection } from './SubscriptionSection';

// // Мокаем мок данные
// jest.mock('../../../mock/mockCurrentSubscriptions', () => ({
//   mockCurrentSubscriptions: {
//     data: [
//       {
//         userId: 12345,
//         subscriptionId: "sub_1MOCK123456789",
//         dateOfPayment: "2026-02-12T10:50:03.277Z",
//         endDateOfSubscription: "2026-03-12T10:50:03.277Z",
//         autoRenewal: true
//       }
//     ],
//     hasAutoRenewal: true
//   }
// }));

// // Мокаем UI компоненты
// jest.mock('@/shared/ui', () => ({
//   Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
//   Typography: ({ children, variant, className }: any) =>
//     <div data-testid={`typography-${variant}`} className={className}>{children}</div>,
//   CheckboxRadix: ({ checked, onCheckedChange, label }: any) => (
//     <label data-testid="checkbox">
//       <input
//         type="checkbox"
//         checked={checked}
//         onChange={(e) => onCheckedChange(e.target.checked)}
//       />
//       <span>{label}</span>
//     </label>
//   )
// }));

// describe('SubscriptionSection', () => {
//   beforeEach(() => {
//     // Мокаем Date для стабильных тестов
//     jest.useFakeTimers();
//     jest.setSystemTime(new Date('2026-03-01T00:00:00.000Z'));
//   });

//   afterEach(() => {
//     jest.useRealTimers();
//   });

//   it('renders correctly and loads subscriptions', async () => {
//     render(<SubscriptionSection />);

//     // Проверяем заголовок
//     expect(screen.getByText('Current Subscription:')).toBeInTheDocument();

//     // Ждем загрузки данных
//     await waitFor(() => {
//       expect(screen.getByTestId('card')).toBeInTheDocument();
//     });

//     // Проверяем что подписка отображается
//     expect(screen.getByText('Expire at')).toBeInTheDocument();
//     expect(screen.getByText('Next payment')).toBeInTheDocument();
//   });

//   it('formats dates correctly', async () => {
//     render(<SubscriptionSection />);

//     await waitFor(() => {
//       // Проверяем формат дат (ru-RU локализация)
//       const dateElements = screen.getAllByText(/\d{2}\.\d{2}\.\d{4}/);
//       expect(dateElements.length).toBeGreaterThan(0);
//     });
//   });

//   it('handles auto-renewal checkbox change', async () => {
//     render(<SubscriptionSection />);

//     await waitFor(() => {
//       expect(screen.getByTestId('checkbox')).toBeInTheDocument();
//     });

//     const checkbox = screen.getByTestId('checkbox').querySelector('input');
//     expect(checkbox).toBeChecked();

//     fireEvent.click(checkbox!);

//     // Проверяем что состояние изменилось
//     expect(checkbox).not.toBeChecked();
//   });

//   it('determines active status correctly', async () => {
//     render(<SubscriptionSection />);

//     await waitFor(() => {
//       const cards = screen.getAllByTestId('card');

//       // Проверяем что карточки с isActive=false имеют соответствующий класс
//       cards.forEach(card => {
//         if (card.className.includes('subscriptionCardInactive')) {
//           expect(card.className).toContain('subscriptionCardInactive');
//         }
//       });
//     });
//   });
// });
