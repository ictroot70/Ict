# Аудит ветки: остальной проект (вне фокуса profile settings/avatar)

Дата: 2026-02-24  
Ветка: `SCRUM-119-User-Profile-Management`  
База сравнения: `f7aedae` (`origin/develop`)

## 1. Контекст по истории коммитов

По истории ветка прошла 4 этапа:

1. База инфраструктуры профиля и shared-слоя (`d213cb3` ... `95738bd`).
2. Фичи профиля/аватара/настроек (`c12b911` ... `fe100b5`).
3. Рефакторинг app/auth/widgets/features (`f572ad2` ... `3bd1aea`).
4. Точечные фиксы и форматирование (`88b2b4d`, `1821b2a`).

Итог: объём большой, много межмодульных изменений. Риски регрессий в auth/navigation/общем UX объективно выше среднего.

## 2. Главные проблемы вне профильного скоупа

### High 1: нарушен governance-контракт quality-gates

- Где: `package.json`.
- Факт:
  - в AGENTS канонический контракт: `pnpm run ci:check`;
  - в проекте script отсутствует.
- Влияние:
  - единый CI-вход не стандартизирован;
  - сложнее автоматически проверять соответствие policy.
- Что сделать:
  - добавить `ci:check` как агрегатор (`lint`, `type-check`, `format:check`, tests).

### High 2: `AuthGuard` допускает рендер защищённого контента до редиректа

- Где: `src/shared/guards/AuthGuard.tsx:19`.
- Факт:
  - при `!isAuthenticated` редирект делается в `useEffect`, но компонент сразу возвращает `children`.
- Влияние:
  - flash protected UI;
  - запуск дочерних запросов и сайд-эффектов до redirect.
- Что сделать:
  - возвращать `null`/loader, пока статус не валиден;
  - рендерить `children` только при подтверждённой авторизации.

### High 3: внешнее location API вызывается через auth baseQuery

- Где:
  - `src/shared/api/location/location.api.ts:13`
  - `src/shared/api/base-query.api.ts:19`
- Факт:
  - `locationApi` инжектится в `baseApi`, где для всех запросов добавляется `Authorization` и логика refresh.
- Риски:
  - лишняя связка внешнего API с auth-механикой;
  - потенциальные CORS/headers проблемы на third-party endpoint.
- Что сделать:
  - выделить отдельный `fetchBaseQuery` без auth/reauth для внешних API.

### High 4: смешение server/client в geolocation API

- Где:
  - `src/shared/api/location/index.ts:9`
  - `src/shared/lib/geolocation/geocoding.ts:1`
  - `src/shared/api/location/location.server.ts:61`
- Факт:
  - в client flow импортируется `reverseGeocode` из `location.server.ts`;
  - в запрос добавляется `User-Agent`.
- Риск:
  - неочевидное поведение в browser runtime (forbidden headers, boundary leakage server->client).
- Что сделать:
  - разделить client/server адаптеры;
  - client-версию держать без server-only заголовков и без `next`-cache API.

### Medium 1: в flow создания поста потеряна визуализация ошибки загрузки

- Где:
  - `src/features/posts/ui/steps/UploadStep.tsx:32`
  - `src/shared/composites/UploadArea/UploadArea.tsx:46`
- Факт:
  - `error` передаётся, но его рендер закомментирован в `UploadArea`.
- Влияние:
  - пользователь не видит причину отказа загрузки файла.

### Medium 2: тестовый контур по-прежнему пустой

- Где: `package.json` (`"test": "echo \"Tests are not configured yet\" && exit 0"`).
- Влияние:
  - нет страховки от регрессий при таком объёме изменений;
  - профилирование рисков переносится в ручное тестирование.

### Medium 3: часть изменений увеличивает технический долг

- Где:
  - `src/entities/users/model/userSelectors.ts` (legacy selectors на `state.user`, неактуальны).
  - `src/shared/api/index.ts` (`export * from './base-query.api'` открывает внутренности API-слоя наружу).
- Влияние:
  - размытие границ модулей и рост случайной связности.

### Low 1: производительность/asset hygiene

- Где: `public/nointernet.png` (добавлен файл ~2.3 MB).
- Влияние:
  - тяжёлый static asset для error-state.
- Что сделать:
  - сжать/конвертировать в `webp/avif`, уменьшить размер.

### Low 2: предупреждения сборки/линта не устранены

- Факты:
  - `no-console` warnings (`src/shared/lib/logger.ts`);
  - warning про Next ESLint plugin;
  - `autoprefixer` warning (`justify-content: end` в `CropStep.module.scss`).

## 3. Что хорошо по проекту в целом

- Проект собирается (`pnpm build`) и проходит `type-check`.
- Переход на in-memory access token (`authTokenStorage`) — шаг в сторону безопасности.
- Добавлен более явный `ApiErrorBoundary` для главной страницы.
- Роутинг профиля структурирован логичнее, чем было до ветки.

## 4. Общий вердикт по ветке (вне профильного скоупа)

Ветка сильная по объёму и по направлению, но несёт системные риски из-за:

- неполного governance-контракта (`ci:check` отсутствует);
- чувствительных изменений auth/navigation;
- смешения client/server границ для geolocation.

Релиз возможен только после закрытия high-пунктов и минимального smoke/e2e покрытия.

## 5. Рекомендуемое направление движения

1. **Стабилизационный спринт**: `ci:check`, guard behavior, внешние API-адаптеры, error UX.
2. **Контрактный спринт**: зафиксировать API-семантики profile/location и покрыть интеграционными тестами.
3. **Уборка долга**: удалить мёртвые slices/selectors, закрыть warnings, облегчить assets.
