# Policy

Policy version: 1.0
Last updated: 2026-02-21

## Project context
- Проект: Instagram-like social network (web app).
- Stack: Next.js App Router (`Next 15`), `React 19`, `TypeScript strict`.
- Архитектурная карта: FSD (`app`, `widgets`, `features`, `entities`, `shared`).
- Package manager: `pnpm`.

## Architecture invariants
- UI-слой является presentation-only: без бизнес-правил и оркестрации.
- Оркестрация сценариев (workflow, async coordination, side effects) выполняется в hooks/controllers/model.
- Data-fetching и отображение разделяются по ответственностям.

### FSD dependency direction matrix
Допустимые импорты (`from -> to`):
- `app` -> `widgets`, `features`, `entities`, `shared`
- `widgets` -> `features`, `entities`, `shared`
- `features` -> `entities`, `shared`
- `entities` -> `shared`
- `shared` -> `shared`

Недопустимые импорты:
- `shared` -> `entities|features|widgets|app`
- `entities` -> `features|widgets|app`
- `features` -> `widgets|app`
- cross-import между несвязанными слайсами одного слоя без явного ownership

## TypeScript invariants
- `strict` обязателен.
- Запрещён `any` в production-коде.
- Запрещён паттерн `as unknown as`.
- Неявная типизация, скрывающая контракт, не допускается.

## Data and RTK Query invariants
- Единый `reauth` flow находится в базовом API-слое; дублировать refresh-логику в UI/feature нельзя.
- Для mutation обязателен понятный cache contract (`invalidateTags`/обоснованное обновление кэша).
- `unwrap()` используется в orchestration-слое, где обрабатывается success/error path.
- Side effects (toast, navigation, tracking) не размещаются в presentation-компонентах.

## Server vs Client boundaries
- `'use client'` допустим только при реальной необходимости:
- forms (React Hook Form),
- animations/gesture APIs,
- browser-only APIs.
- По умолчанию использовать Server Components и App Router conventions.

## Conflict resolution
- “Рабочий код” не является оправданием отклонения от policy.
- Любое вынужденное отклонение фиксируется через TODO/issue и отражается в PR.

## Policy governance
- Новый архитектурный инвариант может быть добавлен только в `policy.md`.
- `playbooks/*` и `AGENTS.md` не имеют права вводить новые архитектурные правила; только ссылки на policy.
- Любое изменение `policy.md` выполняется только через PR с label `policy-change`.
- В PR с `policy-change` обязателен раздел `Contract change`: что изменено, почему, impact/миграция.
