# Sprint 6: MSW Playbook (По Задачам И Разработчикам)

Документ для Sprint 6 (`T0..T7`) о том, где и как использовать `MSW` в тестах.
В чате иногда звучало `MCV`/`mcv` — в проекте используем именно `MSW` (`Mock Service Worker`).

## 1. Цель

- Снизить флаки в PR/CI (меньше зависимости от сети и состояния backend).
- Ускорить ревью (детерминированные тесты для API-сценариев).
- Разделить ответственность:
  - runtime приложения -> реальный API;
  - unit/integration tests -> MSW;
  - финальный smoke/e2e (`T7`) -> реальный API.

## 2. Что Уже Сделано (База Готова)

Эти шаги повторять не нужно, они уже в репозитории:

- MSW dependency подключена (`package.json`).
- Vitest setup подключен:
  - `vitest.config.mts`
  - `vitest.setup.ts`
- Базовая структура для команды:
  - `src/test/msw/handlers/subscriptions.handlers.ts`
  - `src/test/msw/server.ts`
  - `src/test/msw/index.ts`
- Автозапуск тестов в CI:
  - `.github/workflows/unit-tests.yml`

## 3. REAL EXAMPLES vs TEMPLATE

### REAL EXAMPLES (уже реализовано и запускается)

Файл: `src/features/subscriptions/api/subscriptionsApi.msw.test.ts`

- `getPricing` через MSW handler (`T0/T1` read-flow).
- `getCurrentSubscription` через MSW handler (`T0/T1` read-flow).
- `createSubscription` error path `409` через MSW handler (T2-related пример для error matrix).

### TEMPLATE (направление, не "сделано за разработчика")

- `T2` polling/timeout/stop-rules.
- `T3/T4` view-state tests (`Personal/BusinessNoSubscription/BusinessActiveSubscription`).
- `T5` table sorting/pageSize/pagination.
- `T6` modal orchestration branches.

## 4. Матрица: Где MSW Обязателен

| Разработчик | Задачи по плану                   | MSW статус                                                                    | Что покрываем                                                                                                          |
| ----------- | --------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Sem         | `T0`, `T1` (+ support `T2`, `T4`) | Для уже закрытых `T0/T1` ретрофит опционален. Для новых тестов — использовать | `getPricing`, `getCurrentSubscription`, `getPayments`, базовые handlers инфраструктуры                                 |
| Timofey     | `T2`, `T6`                        | Обязательно                                                                   | return flow, polling, error matrix (`400/401/404/409`), idempotency сценарии                                           |
| Evgeniy     | `T3`, `T4` (+ support `T5`)       | Обязательно                                                                   | container/view-state на данных API (`Personal/BusinessNoSubscription/BusinessActiveSubscription`), auto-renew сценарии |
| Dmitriy     | `T5`, `T6`                        | Обязательно                                                                   | my payments table (sorting/pageSize/pagination), modal branches                                                        |

## 5. Что Должны Сделать Разработчики Сейчас

### Timofey (`T2`, `T6`)

- Добавить MSW-based integration tests на:
  - return flow без `status` query;
  - polling (`3s/90s`, success/timeout/stop);
  - idempotency lock;
  - errors `400/401/404/409`.

### Evgeniy (`T3`, `T4`)

- Добавить:
  - resolver unit tests (без MSW);
  - MSW integration test для container/view-state на API данных;
  - auto-renew сценарии (`on/off`) в `T4`.

### Dmitriy (`T5`, `T6`)

- Добавить MSW-based integration tests на:
  - сортировку/пагинацию/pageSize;
  - reset `page=1` при смене `sort/pageSize`;
  - modal branches для `T6`.

## 6. TEMPLATE Сниппеты Для Команды (Ориентир, Не Готовый Тест)

Ниже именно шаблоны направления. Их нужно адаптировать под код своей ветки.

Важно:

- это не "реализовано за задачу";
- это не acceptance criteria;
- каждый snippet нужно адаптировать под реальные компоненты/селекторы/хуки своей ветки.

### T2 (`TEMPLATE`) polling success

```ts
let call = 0
server.use(
  http.get('*/subscriptions/current-payment-subscriptions', () => {
    call += 1
    return HttpResponse.json(
      call < 2
        ? { data: [{ subscriptionId: 'old' }], hasAutoRenewal: true }
        : { data: [{ subscriptionId: 'old' }, { subscriptionId: 'new' }], hasAutoRenewal: true }
    )
  })
)
```

### T3/T4 (`TEMPLATE`) business без активной подписки

```ts
server.use(
  http.get('*/subscriptions/current-payment-subscriptions', () =>
    HttpResponse.json({ data: [], hasAutoRenewal: false })
  )
)

renderWithStore(<AccountManagementPage accountType="business" />)
expect(await screen.findByText(/Change your subscription/i)).toBeInTheDocument()
```

### T5 (`TEMPLATE`) query params таблицы платежей

```ts
server.use(
  http.get('*/subscriptions/my-payments', ({ request }) => {
    const url = new URL(request.url)
    expect(url.searchParams.get('sortBy')).toBe('price')
    expect(url.searchParams.get('sortDirection')).toBe('asc')
    expect(url.searchParams.get('pageSize')).toBe('25')
    return HttpResponse.json({ totalCount: 0, pagesCount: 0, page: 1, pageSize: 25, items: [] })
  })
)
```

### T6 (`TEMPLATE`) error ветка модалки

```ts
server.use(
  http.post('*/subscriptions', () =>
    HttpResponse.json({ message: 'Subscription conflict' }, { status: 409 })
  )
)

await userEvent.click(screen.getByRole('button', { name: /pay/i }))
expect(await screen.findByText(/Transaction failed/i)).toBeInTheDocument()
```

## 7. Обязательные Тесты По Задачам (MUST)

| Задача                                 | Что обязательно проверить тестами                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `T2.1` Return detector + query cleanup | return без `status` query запускает flow; query очищается после обработки                              |
| `T2.2` Polling engine                  | интервал `3s`, timeout `90s`, success по новой/измененной подписке, корректный `stop`                  |
| `T2.3` Idempotency guard               | повторный клик блокируется; при polling кнопки lock; нет автозапуска `createSubscription` после return |
| `T2.4` Payment orchestration           | `create -> redirect -> return` ветки + проброс `400/401/404/409`                                       |
| `T3` Container + views + resolver      | все ветки resolver (`Personal`, `BusinessNoSubscription`, `BusinessActiveSubscription`)                |
| `T4` Current subscription + auto-renew | toggle auto-renew + корректная очередь подписок (`UC-3`)                                               |
| `T5` My payments table                 | sorting, pagination, pageSize, reset `page=1` при смене `sort/pageSize`                                |
| `T6` Modals                            | `PayPal warning`, `Confirm`, `Success`, `Error`, disabled `OK` без `I agree`                           |

## 8. Правило Для Sprint 6

- Если задача трогает API-поток и UI-ветвления (`T2/T3/T4/T5/T6`) -> добавляем хотя бы 1 MSW-based integration test в PR.
- Для чистых функций (`resolver`, `mapper`) -> unit-тесты без MSW.
- Для `T7` -> итоговый smoke на реальном API обязателен.

## 9. Структура Test-Файлов (Важно)

- `subscriptionsApi.msw.test.ts` — только API-level тесты `features/subscriptions/api`.
- Не складываем все сценарии спринта в один файл.
- Каждый владелец задачи пишет тесты рядом со своим модулем:
  - `T2` -> тесты polling/return/idempotency в `T2` модуле;
  - `T3/T4` -> container/view-state/resolver tests рядом с account-management/subscriptions UI/model;
  - `T5` -> table sorting/pagination/pageSize tests рядом с My Payments;
  - `T6` -> modal/wiring tests рядом с модалками/flow.
- Общими остаются только bootstrap-части:
  - `src/test/msw/*` (server + handlers),
  - общие test helpers (если добавятся отдельно).

### 9.1 Рекомендованные Пути По Задачам (Для Команды)

Ниже target-пути для Sprint 6. Если папка еще не создана в вашей ветке, создаем ее при реализации задачи.

- Timofey (`T2`):
  - `src/features/subscriptions/model/__tests__/subscriptionReturnFlow.test.ts`
  - `src/features/subscriptions/model/__tests__/subscriptionPolling.test.ts`
  - `src/features/subscriptions/model/__tests__/subscriptionIdempotency.test.ts`
  - `src/features/subscriptions/ui/__tests__/subscriptionPaymentFlow.test.tsx`
- Evgeniy (`T3`, `T4`):
  - `src/features/subscriptions/model/__tests__/resolveAccountManagementView.test.ts`
  - `src/features/subscriptions/ui/__tests__/AccountManagementPage.test.tsx`
  - `src/features/subscriptions/ui/__tests__/PersonalView.test.tsx`
  - `src/features/subscriptions/ui/__tests__/BusinessNoSubscriptionView.test.tsx`
  - `src/features/subscriptions/ui/__tests__/BusinessActiveSubscriptionView.test.tsx`
  - `src/features/subscriptions/ui/__tests__/AutoRenewalToggle.test.tsx`
- Dmitriy (`T5`, `T6`):
  - `src/features/subscriptions/ui/__tests__/MyPaymentsTable.test.tsx`
  - `src/features/subscriptions/ui/__tests__/MyPaymentsPagination.test.tsx`
  - `src/features/subscriptions/ui/__tests__/SubscriptionModalsFlow.test.tsx`
- Общий API-level (оставляем отдельно):
  - `src/features/subscriptions/api/subscriptionsApi.msw.test.ts`

## 10. Что Писать В PR (Короткий Шаблон)

- Какие handlers добавлены.
- Какой сценарий покрыт тестом.
- Почему выбраны именно эти ветки (`happy path`, `error path`, `edge case`).
- Результат `pnpm run ci:check` и тест-команды.

---

Owner по обновлению документа: `Sem` (или назначенный test-guide owner спринта).
