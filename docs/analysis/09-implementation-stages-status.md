# Реестр этапов реализации (живой статус)

Дата фиксации: 2026-04-01

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

| Этап                   | Scope                                                                                                                          | Текущий статус               | Источник статуса                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- | --------------------------------------------------------- |
| Auth core              | Регистрация, логин, forgot/new password, logout, reCAPTCHA, refresh migration `/auth/update` -> fallback `/auth/update-tokens` | `locked`                     | `auth-core` в `product-requirements-lock.json`            |
| OAuth (Google/GitHub)  | Социальный вход/регистрация                                                                                                    | `optional_or_blocked`        | `oauth-social-sign-in` в `product-requirements-lock.json` |
| Posts CRUD             | Create/Edit/Delete/View постов                                                                                                 | `locked`                     | `posts-crud` в `product-requirements-lock.json`           |
| Public Main Page       | Публичная главная страница/лента                                                                                               | `locked`                     | `public-main-page` в `product-requirements-lock.json`     |
| Profile SSR            | SSR профиля и вход в post modal по query                                                                                       | `locked`                     | `profile-ssr` в `product-requirements-lock.json`          |
| Profile Edit + Avatar  | Редактирование профиля и загрузка аватара                                                                                      | `locked`                     | `profile-avatar` в `product-requirements-lock.json`       |
| Payments/Subscriptions | Платежи и подписки                                                                                                             | `planned` (в работе команды) | `payments` в `product-requirements-lock.json`             |

## Что обновлять при новых фичах/рефакторинге

1. Обновить lock-файлы в `.ai/contracts/` (источник истины).
2. Добавить/обновить `tests/contracts/*` по измененному контракту.
3. Обновить этот файл как короткую сводку для команды.
4. Прогнать `pnpm run ci:check` до коммита.

## Перепроверка целостности: ТЗ + Swagger + Gates (2026-04-01)

### 1) Источники истины для перепроверки

- Реальное ТЗ (TaskShifter -> контракт): `.ai/contracts/taskshifter-traceability-lock.json`
- Продуктовый lock-контракт: `.ai/contracts/product-requirements-lock.json`
- Swagger-решения, зафиксированные в контракте:
  - `AUTH-UC1-FORM-VALIDATION` содержит явную норму:
    `password special character is treated as REQUIRED according to Swagger contract`
- Фронтовый API-контракт маршрутов:
  - `src/shared/api/api-routes.ts`

Примечание: отдельный versioned `openapi/swagger.json` в текущем frontend-репозитории не хранится;
поэтому проверка Swagger-политик выполняется через закрепленные contract-notes + фактический API route contract.

### 2) Что дополнительно усилено в проверках

- Добавлены contract assertions для edit/delete инвариантов постов в:
  - `tests/contracts/posts-and-rendering.contract.test.ts`
- Покрыты дополнительные пункты:
  - наличие `Edit Post` / `Delete Post` в меню действий own-post;
  - тексты/кнопки confirm-модалки удаления (`Delete Post`, `Yes/No`, `Deleting...`);
  - edit-flow через update mutation с `postId` и передачей description.

### 3) Фактические результаты прогонов

- `pnpm run test:contracts` -> `PASS` (`52/52`)
- `pnpm run test:e2e:smoke` -> `PASS` (`18/18`, chromium/firefox/webkit)
- `pnpm run verify:smart` -> `PASS` (`fullCheck: executed`)
  - `ci:check` -> `PASS`
  - `test:e2e:smoke` -> `PASS`
  - `perf:check` -> `PASS`
    - `/` CLS `0.0001`
    - `/profile/1` CLS `0`

### 4) Вывод по целостности

- Целостность приложения и инфраструктуры quality-gates на текущем этапе не нарушена.
- Ключевые locked-сценарии (auth, posts CRUD constraints/confirmations, public main page, profile SSR, profile avatar) подтверждены контрактами и прогоном full verification.
- `knownGaps` из traceability остаются без изменений (новых пробелов не добавлено).

## Stage 05: Edit Profile + User Posts SSR (ТЗ/Swagger, 2026-04-01)

### 1) Проверенный scope

- SSR профиль пользователя (`/profile/:id`) для guest/auth.
- SSR открытие поста пользователя по прямой ссылке (`/profile/:id?postId=:postId&from=:source`).
- Редактирование профиля (General Information).
- Upload/Delete аватара.
- Клиентская догрузка auth-зависимых частей (`/me`), при SSR рендере публичного контента.

### 2) Сверка с ТЗ и Swagger (факт по коду)

- SSR профиль и SSR post modal entry:
  - server fetch профиля/постов/целевого поста в `src/app/profile/[id]/page.tsx`;
  - query `postId`/`from` обрабатывается на сервере, source нормализуется в `home|profile|direct`.
- Правило закрытия пост-модалки:
  - при `from=home` -> возврат на `/`;
  - при `from=profile|direct` -> возврат на `/profile/:id` (очистка `postId`/`from`).
- Edit profile:
  - username `6..30`, pattern `^[a-zA-Z0-9_-]*$` (по сути через `+` в regex);
  - firstName/lastName `1..50`;
  - aboutMe `0..200`;
  - under-13 policy + `Privacy Policy` link;
  - `Save Changes` disabled при invalid/not dirty/submitting.
- Swagger profile endpoints:
  - `GET/PUT/DELETE /v1/users/profile`
  - `POST/DELETE /v1/users/profile/avatar`
  - `DELETE /v1/users/profile/{id}`
  - route map и методы подтверждены кодом API слоя.
- Payload update profile:
  - `dateOfBirth` маппится как ISO datetime (`toISOString`) или `null`.

### 3) Усиление контрактных тестов под Stage 05

- `tests/contracts/profile-avatar.contract.test.ts`:
  - добавлены проверки Swagger endpoint map/profile API methods;
  - добавлена проверка `dateOfBirth` mapper (ISO/null);
  - расширены boundary checks валидации профиля (username chars, firstName max length).
- `tests/contracts/posts-and-rendering.contract.test.ts`:
  - добавлена проверка close-post routing behavior (`home` vs `profile/direct`).

### 4) Результаты quality-gates после усилений

- `pnpm run test:contracts` -> `PASS` (`58/58`)
- `APP_BASE_URL=http://127.0.0.1:3100 VERIFY_FULL_SKIP_CI=1 pnpm run verify:full` -> `PASS`
  - `test:e2e:smoke` -> `PASS` (`18/18`)
  - `perf:check` -> `PASS` (`/` CLS `0.0001`, `/profile/1` CLS `0`)
- Примечание по инфраструктуре запуска:
  - `verify:smart` может дать флейк `Server is not reachable: http://127.0.0.1:3000`, если порт `3000` уже занят сторонним процессом.

### 5) Verdict по целостности

- Реализация Stage 05 не нарушила целостность проекта и инфраструктуры верификации.
- Критичные сценарии SSR/profile/avatar/edit profile подтверждены кодом, контрактами и full gate.
- Оставшиеся lint warnings носят некритичный характер и не блокируют контрактную целостность.
