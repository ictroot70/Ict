// import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
// import { AccountManagement } from './AccountManagement';

// // Мокаем дочерние компоненты
// jest.mock('./SubscriptionSection/SubscriptionSection', () => ({
//   SubscriptionSection: () => <div data-testid="subscription-section">Subscription Section</div>
// }));

// jest.mock('./AccountTypeSection/AccountTypeSection', () => ({
//   AccountTypeSection: ({ accountTypes, selectedType, onTypeChange }: any) => (
//     <div data-testid="account-type-section">
//       <div data-testid="selected-type">{selectedType}</div>
//       <button
//         data-testid="change-to-business"
//         onClick={() => onTypeChange('business')}
//       >
//         Change to Business
//       </button>
//       <button
//         data-testid="change-to-personal"
//         onClick={() => onTypeChange('personal')}
//       >
//         Change to Personal
//       </button>
//     </div>
//   )
// }));

// jest.mock('./PlansSection/PlansSection', () => ({
//   PlansSection: () => <div data-testid="plans-section">Plans Section</div>
// }));

// describe('AccountManagement', () => {
//   it('renders all sections', () => {
//     render(<AccountManagement />);

//     expect(screen.getByTestId('subscription-section')).toBeInTheDocument();
//     expect(screen.getByTestId('account-type-section')).toBeInTheDocument();
//   });

//   it('initially shows personal account type', () => {
//     render(<AccountManagement />);

//     expect(screen.getByTestId('selected-type')).toHaveTextContent('personal');
//   });

//   it('does not show plans section for personal account', () => {
//     render(<AccountManagement />);

//     expect(screen.queryByTestId('plans-section')).not.toBeInTheDocument();
//   });

//   it('shows plans section when account type is changed to business', () => {
//     render(<AccountManagement />);

//     // Меняем на business
//     fireEvent.click(screen.getByTestId('change-to-business'));

//     expect(screen.getByTestId('plans-section')).toBeInTheDocument();
//     expect(screen.getByTestId('selected-type')).toHaveTextContent('business');
//   });

//   it('hides plans section when account type is changed back to personal', () => {
//     render(<AccountManagement />);

//     // Меняем на business
//     fireEvent.click(screen.getByTestId('change-to-business'));
//     expect(screen.getByTestId('plans-section')).toBeInTheDocument();

//     // Меняем обратно на personal
//     fireEvent.click(screen.getByTestId('change-to-personal'));
//     expect(screen.queryByTestId('plans-section')).not.toBeInTheDocument();
//     expect(screen.getByTestId('selected-type')).toHaveTextContent('personal');
//   });

//   it('renders dividers correctly', () => {
//     const { container } = render(<AccountManagement />);

//     // Проверяем наличие разделителей
//     const dividers = container.querySelectorAll('.divider');
//     expect(dividers.length).toBe(1); // Один разделитель между Subscription и AccountType

//     // Меняем на business и проверяем второй разделитель
//     fireEvent.click(screen.getByTestId('change-to-business'));

//     const updatedDividers = container.querySelectorAll('.divider');
//     expect(updatedDividers.length).toBe(2); // Добавляется разделитель перед PlansSection
//   });
// });