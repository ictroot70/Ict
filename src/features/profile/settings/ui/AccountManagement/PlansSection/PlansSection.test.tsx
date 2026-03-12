// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import { PlansSection } from './PlansSection';

// // Мокаем мок данные
// jest.mock('../../../mock/mockCurrentSubscriptions', () => ({
//   mockSubscriptionCosts: {
//     data: [
//       { amount: 10, typeDescription: "1DAY" },
//       { amount: 50, typeDescription: "7DAY" },
//       { amount: 100, typeDescription: "MONTHLY" }
//     ]
//   }
// }));

// // Мокаем UI компоненты
// jest.mock('@/shared/ui', () => ({
//   Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
//   Typography: ({ children, variant, className }: any) =>
//     <div data-testid={`typography-${variant}`} className={className}>{children}</div>,
//   Button: ({ children, onClick, className, variant }: any) => (
//     <button data-testid={`button-${variant}`} onClick={onClick} className={className}>
//       {children}
//     </button>
//   )
// }));

// jest.mock('@ictroot/ui-kit', () => ({
//   RadioGroupRadix: ({ label, value, onValueChange, options, orientation }: any) => (
//     <div data-testid="radio-group" data-orientation={orientation}>
//       <div data-testid="radio-label">{label}</div>
//       {options.map((option: any) => (
//         <button
//           key={option.value}
//           data-testid={`radio-option-${option.value}`}
//           data-checked={value === option.value}
//           onClick={() => onValueChange(option.value)}
//         >
//           {option.label}
//         </button>
//       ))}
//     </div>
//   )
// }));

// describe('PlansSection', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('renders correctly and loads plans', async () => {
//     render(<PlansSection />);

//     // Проверяем заголовок
//     expect(screen.getByText('Change your subscription:')).toBeInTheDocument();

//     // Ждем загрузки данных
//     await waitFor(() => {
//       expect(screen.getByTestId('radio-group')).toBeInTheDocument();
//     });

//     // Проверяем что опции отображаются
//     await waitFor(() => {
//       expect(screen.getByTestId('radio-option-1day')).toBeInTheDocument();
//       expect(screen.getByTestId('radio-option-7day')).toBeInTheDocument();
//       expect(screen.getByTestId('radio-option-month')).toBeInTheDocument();
//     });
//   });

//   it('formats plan labels correctly', async () => {
//     render(<PlansSection />);

//     await waitFor(() => {
//       const option1day = screen.getByTestId('radio-option-1day');
//       const option7day = screen.getByTestId('radio-option-7day');
//       const optionMonth = screen.getByTestId('radio-option-month');

//       expect(option1day).toHaveTextContent('$10 per 1 Day');
//       expect(option7day).toHaveTextContent('$50 per 7 Days');
//       expect(optionMonth).toHaveTextContent('$100 per month');
//     });
//   });

//   it('handles plan selection', async () => {
//     render(<PlansSection />);

//     await waitFor(() => {
//       expect(screen.getByTestId('radio-option-month')).toBeInTheDocument();
//     });

//     const day1Option = screen.getByTestId('radio-option-1day');
//     fireEvent.click(day1Option);

//     // Проверяем что выбранный план изменился
//     expect(day1Option).toHaveAttribute('data-checked', 'true');
//   });

//   it('handles PayPal button click', async () => {
//     render(<PlansSection />);

//     await waitFor(() => {
//       expect(screen.getByTestId('button-outline')).toBeInTheDocument();
//     });

//     const paypalButton = screen.getAllByTestId('button-outline')[0];
//     fireEvent.click(paypalButton);

//     // Проверяем что появилась сводка платежа
//     await waitFor(() => {
//       expect(screen.getByText(/You selected:/)).toBeInTheDocument();
//       expect(screen.getByText(/PayPal/)).toBeInTheDocument();
//     });
//   });

//   it('handles Stripe button click', async () => {
//     render(<PlansSection />);

//     await waitFor(() => {
//       expect(screen.getByTestId('button-outline')).toBeInTheDocument();
//     });

//     const stripeButton = screen.getAllByTestId('button-outline')[1];
//     fireEvent.click(stripeButton);

//     // Проверяем что появилась сводка платежа
//     await waitFor(() => {
//       expect(screen.getByText(/You selected:/)).toBeInTheDocument();
//       expect(screen.getByText(/Stripe/)).toBeInTheDocument();
//     });
//   });

//   it('shows payment summary after selecting payment method', async () => {
//     render(<PlansSection />);

//     await waitFor(() => {
//       expect(screen.getByTestId('button-outline')).toBeInTheDocument();
//     });

//     // Выбираем план
//     const day1Option = screen.getByTestId('radio-option-1day');
//     fireEvent.click(day1Option);

//     // Выбираем метод оплаты
//     const paypalButton = screen.getAllByTestId('button-outline')[0];
//     fireEvent.click(paypalButton);

//     // Проверяем сводку
//     expect(screen.getByText(/You selected:/)).toBeInTheDocument();
//     expect(screen.getByText(/\$10 per 1 Day/)).toBeInTheDocument();
//     expect(screen.getByText(/PayPal/)).toBeInTheDocument();
//     expect(screen.getByText('Confirm Payment')).toBeInTheDocument();
//   });

//   it('handles confirm payment button click', async () => {
//     const consoleSpy = jest.spyOn(console, 'log');

//     render(<PlansSection />);

//     await waitFor(() => {
//       expect(screen.getByTestId('button-outline')).toBeInTheDocument();
//     });

//     // Выбираем план и метод оплаты
//     const day1Option = screen.getByTestId('radio-option-1day');
//     fireEvent.click(day1Option);

//     const paypalButton = screen.getAllByTestId('button-outline')[0];
//     fireEvent.click(paypalButton);

//     // Нажимаем Confirm Payment
//     const confirmButton = screen.getByText('Confirm Payment');
//     fireEvent.click(confirmButton);

//     expect(consoleSpy).toHaveBeenCalledWith('Processing payment with PayPal for plan:', '1day');
//   });
// });