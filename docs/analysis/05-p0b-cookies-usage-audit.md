# P0B Readiness: `cookies()` Usage Audit

Дата: 2026-03-13  
Ветка: `SCRUM-150-P0B-Readiness-cookies-Usage-Audit`

## 1. Цель

Проверить все server-вызовы `cookies()` и подтвердить, можно ли безопасно вынести `auth-hint` из root layout без регрессии SSR и first-paint auth UI.

## 2. Результат поиска

Поиск по репозиторию показал только 2 server-вызова `cookies()`:

1. `src/shared/lib/storage/auth-session-hint.server.ts:8`
2. `src/shared/lib/storage/auth-session-hint.server.ts:14`

Дополнительно:

- других импортов `next/headers` в production-коде не найдено;
- оба вызова используются только из `src/app/layout.tsx`.

## 3. Где именно используется результат

### Источник чтения cookies

- `src/shared/lib/storage/auth-session-hint.server.ts`
  - `getServerAuthSessionHint()`
  - `getServerAuthUserIdHint()`

### Единственная точка server consumption

- `src/app/layout.tsx`
  - `initialAuthHint = await getServerAuthSessionHint()`
  - `initialAuthUserIdHint = await getServerAuthUserIdHint()`
  - оба значения прокидываются в `AuthSessionHintProvider`

### Клиентские потребители результата

- `src/shared/auth/useEffectiveAuthHint.ts`
  - объединяет server initial hint и client cookie/localStorage hint
- `src/features/posts/utils/useAuthUiState.ts`
  - строит `authenticated | guest | loading`
- `src/app/RootLayoutClient.tsx`
  - решает, показывать ли `Sidebar`, `SidebarSkeleton`, `CreatePostWrapper`
- `src/widgets/Header/components/HeaderControls/HeaderControls.tsx`
  - решает, показывать ли `HeaderSkeleton`, `NotificationButton`, `AuthBtn`
- `src/entities/profile/hooks/useProfile.ts`
  - использует `hasAuthHint` и `authUserIdHint` для auth skeleton и own-profile fallback на public profile

## 4. Verdict

Вывод по выносу `auth-hint` из root layout: `unsafe`.

## 5. Почему сейчас unsafe

### `auth_session_hint`

- влияет на первый SSR/initial render через `useEffectiveAuthHint()`;
- без server initial hint статус auth UI на первом проходе стартует как `guest`, а не как `loading`;
- это меняет поведение global shell:
  - header;
  - sidebar;
  - create-post shell.

### `auth_user_id_hint`

- используется не только для глобального auth shell;
- влияет на public profile UX:
  - skeleton variant;
  - fallback-определение own profile до прихода фактического `me`.

## 6. Что это значит для задачи

Задача аудита выполнена.

- список всех server-вызовов `cookies()` собран;
- точка использования подтверждена;
- safe/unsafe verdict дан;
- прямой implementation по выносу из `src/app/layout.tsx` в текущем состоянии делать не нужно.

## 7. Follow-up: нужен отдельный refactor

Если к этой теме возвращаться позже, следующий шаг должен быть отдельной refactor-задачей, а не прямым переносом чтения `cookies()` из root layout.

Рекомендуемое направление:

1. Локализовать потребителей `auth-hint` по сегментам, чтобы global root shell не зависел от auth cookie.
2. Развести use-cases:
   - global auth shell;
   - public profile auth skeleton;
   - own-profile fallback.
3. После локализации повторно проверить, можно ли убрать server read из `src/app/layout.tsx` без SSR/hydration regression.

## 8. Проверки

Запущено:

- `pnpm run ci:check` -> green

Примечание:

- в проекте есть warnings lint/build, но quality-gate по этой задаче не падает.
