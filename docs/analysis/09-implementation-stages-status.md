# Реестр этапов реализации (живой статус)

Дата фиксации: 2026-03-31

## Зачем этот файл

Этот файл нужен как человекочитаемая сводка по этапам проекта и их текущему статусу.
Канонический источник для CI-проверок остается в lock-файлах:

- `.ai/contracts/product-requirements-lock.json`
- `.ai/contracts/taskshifter-traceability-lock.json`

## Как проверяем, что не ломаем текущую логику

Обязательный quality-gate контракт:

- `pnpm run ci:check`

Что покрывает:

- `lint`
- `typecheck`
- `contract:check`
- `traceability:check`
- `test:contracts`
- `build`

## Этапы и статус

| Этап | Scope | Текущий статус | Источник статуса |
|---|---|---|---|
| Auth core | Регистрация, логин, forgot/new password, logout, reCAPTCHA, refresh migration `/auth/update` -> fallback `/auth/update-tokens` | `locked` | `auth-core` в `product-requirements-lock.json` |
| OAuth (Google/GitHub) | Социальный вход/регистрация | `optional_or_blocked` | `oauth-social-sign-in` в `product-requirements-lock.json` |
| Posts CRUD | Create/Edit/Delete/View постов | `locked` | `posts-crud` в `product-requirements-lock.json` |
| Public Main Page | Публичная главная страница/лента | `locked` | `public-main-page` в `product-requirements-lock.json` |
| Profile SSR | SSR профиля и вход в post modal по query | `locked` | `profile-ssr` в `product-requirements-lock.json` |
| Profile Edit + Avatar | Редактирование профиля и загрузка аватара | `locked` | `profile-avatar` в `product-requirements-lock.json` |
| Payments/Subscriptions | Платежи и подписки | `planned` (в работе команды) | `payments` в `product-requirements-lock.json` |

## Что обновлять при новых фичах/рефакторинге

1. Обновить lock-файлы в `.ai/contracts/` (источник истины).
2. Добавить/обновить `tests/contracts/*` по измененному контракту.
3. Обновить этот файл как короткую сводку для команды.
4. Прогнать `pnpm run ci:check` до коммита.
