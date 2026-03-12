// Мок для текущих подписок
export const mockCurrentSubscriptions = {
  data: [
    {
      userId: 12345,
      subscriptionId: "sub_1MOCK123456789",
      dateOfPayment: "2026-02-12T10:50:03.277Z",
      endDateOfSubscription: "2026-03-12T10:50:03.277Z",
      autoRenewal: true
    },
    {
      userId: 12345,
      subscriptionId: "sub_1MOCK987654321",
      dateOfPayment: "2026-03-13T10:50:03.277Z",
      endDateOfSubscription: "2026-04-14T10:50:03.277Z",
      autoRenewal: true
    },
    {
      userId: 12345,
      subscriptionId: "sub_1MOCK555555555",
      dateOfPayment: "2026-04-14T10:50:03.277Z",
      endDateOfSubscription: "2026-05-15T10:50:03.277Z",
      autoRenewal: false
    }
  ],
  hasAutoRenewal: true
};

// Мок для стоимости планов
export const mockSubscriptionCosts = {
  data: [
    {
      amount: 10,
      typeDescription: "1DAY"
    },
    {
      amount: 50,
      typeDescription: "7DAY"
    },
    {
      amount: 100,
      typeDescription: "MONTHLY"
    }
  ]
};

// Мок для истории платежей
export const mockMyPayments = {
  totalCount: 3,
  pagesCount: 1,
  page: 1,
  pageSize: 10,
  items: [
    {
      userId: 12345,
      subscriptionId: "sub_1MOCK123456789",
      dateOfPayment: "2026-02-12T10:50:03.287Z",
      endDateOfSubscription: "2026-03-12T10:50:03.287Z",
      price: 100,
      subscriptionType: "MONTHLY",
      paymentType: "STRIPE"
    },
    {
      userId: 12345,
      subscriptionId: "sub_1MOCK987654321",
      dateOfPayment: "2026-03-13T10:50:03.287Z",
      endDateOfSubscription: "2026-04-13T10:50:03.287Z",
      price: 50,
      subscriptionType: "7DAY",
      paymentType: "STRIPE"
    },
    {
      userId: 12345,
      subscriptionId: "sub_1MOCK555555555",
      dateOfPayment: "2026-04-14T10:50:03.287Z",
      endDateOfSubscription: "2026-04-15T10:50:03.287Z",
      price: 10,
      subscriptionType: "1DAY",
      paymentType: "STRIPE"
    }
  ]
};