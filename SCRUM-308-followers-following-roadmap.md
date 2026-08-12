# SCRUM-308 Roadmap: Followers and Following Lists

## Актуальное состояние на 2026-08-12

Ветка:

- `SCRUM-308-UC-6-followers-following`
- base: `develop`

Главный вывод после проверки 12 августа: backend починил toggle-логику, и наша текущая WIP-реализация на 308 уже работает по правильному контракту.

Правильный контракт сейчас такой:

```http
POST /api/v1/users/following
{
  "selectedUserId": 353
}
```

Эта ручка работает как toggle:

- если подписки нет, создаёт подписку;
- если подписка уже есть, удаляет её.

Отдельная ручка:

```http
DELETE /api/v1/users/follower/{userId}
```

используется только для удаления пользователя из своих `Followers`. Её нельзя использовать для `Unfollow` из `Following`.

## Что сейчас уже сделано в WIP

- `Following` / `Followers` стали кликабельными только когда пользователь авторизован и count больше 0.
- Для гостей модалка больше не открывается и не показывает ложную ошибку `Failed to load users` вместо проблемы авторизации.
- `Following` и `Followers` загружаются в модалке через API.
- В модалке есть loading / empty / error states.
- Поиск внутри списка сохранён.
- Infinite scroll сохранён.
- Клик по пользователю ведёт в его профиль.
- `Following` показывает `Unfollow`.
- `Followers` показывает `Follow` только если текущий пользователь ещё не подписан на этого подписчика.
- `Followers` не показывает `Unfollow`.
- `Followers` показывает `Delete` для удаления подписчика.
- `Unfollow` теперь использует `POST /api/v1/users/following` как toggle, а не `DELETE /api/v1/users/follower/{userId}`.
- После follow / unfollow / delete список проверяется refetch-запросом, а UI меняется только после подтверждения состояния сервером.
- Убрана локальная “успешная” фильтрация списка без подтверждения backend.
- Убрано optimistic patching follow/unfollow cache, потому что с toggle-ручкой оно давало ложное состояние и повторные toggle-запросы.
- Для followers/following списков добавлен RTK Query cache contract через `FollowList` tags.
- Глобальный `cache: 'no-store'` из `base-query.api.ts` убран, чтобы не менять поведение всех API-запросов ради одного сценария.

## Что проверено вручную

Проверено на ветке `SCRUM-308-UC-6-followers-following` после backend-фикса:

- Follow на странице пользователя работает: пользователь появляется в моём `Following`, счётчик увеличивается.
- Unfollow на странице пользователя работает: пользователь исчезает из моего `Following`, счётчик уменьшается.
- `Following` modal открывается, показывает список, `Unfollow` удаляет пользователя из списка и обновляет счётчик.
- После refresh удалённый через `Following` modal пользователь не возвращается.
- `Followers` modal для пользователя, на которого я не подписан, показывает `Follow` и `Delete`.
- `Follow` из `Followers` modal работает: пользователь появляется в моём `Following`.
- После того как я подписался на follower, в `Followers` modal остаётся только `Delete`, без `Unfollow`.

Edge case, который оставляем без отдельной обработки:

- Если один и тот же профиль открыт в другом окне/вкладке, а подписка меняется из модалки в первом окне, кнопка во втором окне может быть stale до refetch/refresh. Это ожидаемый эффект toggle-ручки и stale страницы; в рамках UC-6 не обрабатываем.

## Что ещё нужно проверить перед финалом

1. Финально проверить `Delete` в `Followers`:
   - `Delete -> No` ничего не меняет;
   - `Delete -> Yes` вызывает `DELETE /api/v1/users/follower/{userId}`;
   - пользователь исчезает из `Followers`;
   - `followersCount` уменьшается;
   - после refresh удалённый follower не возвращается.
2. Проверить error state для `Delete`, если backend вернёт ошибку.
3. Перед PR ещё раз прогнать проверки.

## Review comments status на 2026-08-12

### Закрыто

Старые замечания Дмитрия:

- ошибки Follow / Unfollow обрабатываются через `actionError`;
- гость больше не открывает followers/following modal, потому что `onStatClick` передаётся только при `isAuthenticated`;
- во время pending mutation блокируются все action-кнопки в списке;
- пустой результат поиска показывает `No users found`;
- custom confirm dialog заменён на общий `Modal`;
- лишняя reset-логика по `open/mode` убрана.

Свежие замечания Дмитрия:

- `Unfollow` больше не использует `DELETE /api/v1/users/follower/{userId}`;
- `Unfollow` использует правильный toggle через `POST /api/v1/users/following`;
- в `Following` кнопка `Unfollow` показывается только если `user.isFollowing === true`;
- при `0 Followers/Following` модалка не отправляет лишние запросы;
- поиск при count `0` disabled;
- `_t: Date.now()` удалён из followers/following запросов.
- ручной close symbol `×` в `FollowListModal.tsx` удалён; заголовок и close control теперь отрисовывает ui-kit `Modal` через `modalTitle`.
- confirm-модалки подогнаны под макет: убраны двойные горизонтальные padding внутри content, текстовый блок расширен до макетной ширины.
- follow-list modal и confirm-модалки подогнаны по позиционированию ближе к Figma: внешняя модалка закреплена в макетной зоне, confirm расположен поверх списка без лишних внутренних горизонтальных отступов.
- cache contract для followers/following списков добавлен через `FollowList` tags; `followUser`, `unfollowUser` и `deleteFollower` инвалидируют связанные profile/list cache entries.
- глобальный `cache: 'no-store'` удалён из `base-query.api.ts`.
- `useFollowListActions` упрощён локальными helper-ами для pending-state и применения verified list; `Unfollow` в чужом `Following` больше не удаляет строку из чужого списка, а только обновляет `isFollowing`.

Комментарий Сэма по `Followers`:

- в `Followers` кнопка `Follow` показывается только если `user.isFollowing === false`;
- в `Followers` не показывается `Unfollow`;
- в `Followers` есть `Delete`;
- после actions список не меняется fake-успешно, а проверяется через refetch.

### Открыто / проверить отдельной итерацией

- `Delete follower` нужно финально проверить вручную:
  - `No` не меняет список;
  - `Yes` удаляет follower;
  - count уменьшается;
  - после refresh follower не возвращается.
- Проверить вручную, что после замены глобального `cache: 'no-store'` на RTK Query tags follow/unfollow/delete всё ещё обновляют список и счётчики без stale состояния.

### Не усложнять без необходимости

- Не переписывать весь modal flow заново.
- Не объединять `UnfollowConfirm` и `DeleteFollowerConfirm` только ради абстракции, пока правки маленькие и риск регрессии выше пользы.
- Не выносить props/state/actions в новую архитектуру, если конкретный review-пункт можно закрыть маленькой локальной правкой.
- Не возвращать fake UI success без backend refetch-проверки.

## Уже пройденные автоматические проверки

```bash
pnpm test:run src/entities/users/api/usersFollow.api.test.ts src/entities/users/model/userFollow.slice.test.ts
pnpm typecheck
pnpm lint
prettier --check src/entities/profile/ui/Profile/FollowListModal/FollowListModal.tsx src/entities/profile/ui/Profile/FollowListModal/FollowListUsers.tsx src/entities/profile/ui/Profile/FollowListModal/useFollowListActions.ts src/entities/profile/ui/Profile/Profile.tsx src/entities/profile/ui/Profile/ProfileStats/ProfileStats.tsx src/entities/users/api/api.types.ts src/entities/users/api/usersFollow.api.test.ts src/entities/users/api/usersFollow.api.ts src/entities/users/hooks/useFollowUserState.ts src/shared/api/base-query.api.ts
```

Результат:

- tests passed;
- typecheck passed;
- lint passed, остались только существующие warnings в `src/shared/lib/logger.ts`;
- prettier check passed.

## Следующий практический шаг

Не переписывать реализацию заново. Сейчас разумный путь:

1. Проверить `Delete follower` руками.
2. Ручками перепроверить follow/unfollow/delete после перехода на `FollowList` tags вместо глобального `no-store`.
3. Ещё раз прогнать проверки.
4. После этого готовить PR/update для review.

## Архивное состояние на 2026-08-05

PR уже открыт:

- `SCRUM-308 add followers and following lists`
- branch: `SCRUM-308-UC-6-followers-following`
- base: `develop`

Базовая часть задачи уже реализована:

- кликабельные счетчики `Followers` / `Following`;
- модалка со списком пользователей;
- поиск внутри списка;
- infinite scroll;
- переход в профиль пользователя из строки списка;
- Follow / Unfollow actions;
- confirm-модалка для Unfollow;
- обработка loading / empty / error states;
- обработка ошибок Follow / Unfollow;
- скрытие actions для неавторизованного пользователя;
- блокировка actions во время pending mutation;
- корректный empty state для поиска: `No users found`;
- confirm-модалка переведена на общий `Modal`;
- лишняя reset-логика по `open/mode` убрана.

Новый комментарий по review/Figma/Swagger: нужно скорректировать именно режим `Followers`.

### Что нужно изменить в Followers

В режиме `Followers` логика отличается от `Following`.

Для каждого подписчика:

- если `isFollowing === false`, показываем кнопку `Follow`;
- если `isFollowing === true`, кнопку `Unfollow` не показываем вообще;
- рядом должна быть кнопка `Delete`;
- `Delete` удаляет пользователя из списка моих подписчиков через:

```http
DELETE /api/v1/users/follower/{userId}
```

После успешного удаления:

- убрать пользователя из текущего списка без перезагрузки страницы;
- обновить `followersCount` без перезагрузки страницы;
- не ломать search / pagination state.

При ошибке удаления:

- список остаётся без изменений;
- пользователь видит сообщение об ошибке.

### Что остаётся в Following

В режиме `Following` текущая логика в целом соответствует дизайну:

- показываем `Unfollow`;
- перед Unfollow открываем confirm-модалку;
- после успешного Unfollow обновляем список;
- кнопки `Delete` в `Following` нет.

### Новые шаги

#### Шаг 1. Переключиться на ветку и проверить состояние

Команды:

```bash
git switch SCRUM-308-UC-6-followers-following
git fetch
git status --short
git merge origin/develop
```

Если `git merge origin/develop` скажет `Already up to date`, можно продолжать.

Если будут конфликты — остановиться и разрулить их до новых изменений.

#### Шаг 2. Проверить существующие API hooks

Нужно посмотреть, есть ли уже mutation для удаления подписчика:

- route: `API_ROUTES.USERS_FOLLOW.DELETE_FOLLOWER(userId)`;
- expected endpoint: `DELETE /api/v1/users/follower/{userId}`;
- возможный hook: `useDeleteFollowerMutation` или похожее имя.

Если mutation уже есть — используем её.

Если mutation нет — добавить её в users API и экспортировать hook.

#### Шаг 3. Разделить UI actions для `followers` и `following`

Сейчас `FollowListUsers` использует общую кнопку `Follow/Unfollow`.

Нужно передать в список `mode` и сделать разные правила:

- `following`:
  - показывать `Unfollow`;
  - использовать существующий confirm для Unfollow.
- `followers`:
  - показывать `Follow` только если `!user.isFollowing`;
  - если `user.isFollowing`, на месте Follow ничего не показывать;
  - всегда показывать `Delete` для подписчика, если это мой профиль и пользователь не текущий пользователь.

Важно: в чужом профиле удалять подписчиков нельзя. `Delete` должен быть доступен только когда открыта модалка подписчиков моего профиля.

#### Шаг 4. Добавить confirm для Delete follower

Confirm должен быть отдельным по смыслу от Unfollow:

- заголовок по дизайну: что-то вроде `Delete Following` / `Delete follower` — финальный текст лучше сверить с Figma и текущими названиями в проекте;
- текст должен ясно говорить, что пользователь будет удалён из подписчиков;
- кнопки `Yes` / `No`;
- использовать общий `Modal`, как в уже исправленном Unfollow confirm.

#### Шаг 5. После успешного Delete обновить UI без reload

После успешной mutation:

- удалить пользователя из `users` state;
- уменьшить локальный followers count на 1;
- если родительский профиль хранит count отдельно, прокинуть callback наверх;
- если count живёт только в заголовке модалки, обновить локальный count внутри модалки.

Нужно посмотреть текущий код `Profile` / `ProfileInfo`: где именно хранится и отображается `followersCount`.

#### Шаг 6. Ошибки и pending

Нужно сохранить текущую модель:

- во время mutation блокировать действия;
- при ошибке показывать понятное сообщение;
- при ошибке не менять список;
- confirm-модалку не закрывать до успешного ответа или закрывать только если это уже принятое UX-решение.

#### Шаг 7. Проверки

Минимум:

```bash
pnpm typecheck
pnpm test:run src/entities/profile src/entities/users
```

Ручная проверка:

- открыть `Followers`;
- у пользователя с `isFollowing === false` есть `Follow`;
- у пользователя с `isFollowing === true` нет `Unfollow`;
- у подписчиков моего профиля есть `Delete`;
- `Delete` открывает confirm;
- `No` закрывает confirm без изменений;
- `Yes` удаляет пользователя из списка и обновляет count;
- при ошибке список не меняется и показывается error message;
- в `Following` старая логика `Unfollow` не сломалась.

## Цель задачи

Сделать кликабельными уже существующие счетчики `Following` и `Followers` на странице профиля.

Когда пользователь нажимает на один из счетчиков, приложение должно показать соответствующий список пользователей:

- `Following` — пользователи, на которых подписан этот профиль.
- `Followers` — пользователи, которые подписаны на этот профиль.

`Publications` в рамках этой задачи не трогаем.

## Продуктовое решение

Не добавляем новый пункт в sidebar.

Эта функция относится к странице профиля, потому что это детализация уже видимой статистики профиля. Это не отдельный раздел приложения вроде `Feed`, `Messenger` или `Search`.

Лучший вариант для первого релиза:

- Оставить счетчики визуально на том же месте.
- Сделать кликабельными только `Following` и `Followers`.
- Добавить hover/focus состояние, чтобы пользователь понял, что на счетчик можно нажать.
- По клику открывать модальное окно со списком пользователей.
- Закрывать модалку по `X`, клику вне модалки или при переходе в профиль пользователя.

Почему модалка:

- пользователь остается в контексте профиля;
- не нужна новая страница и новая навигация;
- поведение естественное: увидел число, нажал, получил список за этим числом.

## Что уже есть в проекте

### Profile UI

Главная точка входа:

- `src/entities/profile/ui/Profile/ProfileStats/ProfileStats.tsx`

Сейчас этот компонент просто рисует три статичных элемента:

- `Following`
- `Followers`
- `Publications`

Родительский компонент:

- `src/entities/profile/ui/Profile/ProfileInfo/ProfileInfo.tsx`

Там уже есть нужные данные:

- `profile.userName`
- `profile.userMetadata.following`
- `profile.userMetadata.followers`
- `profile.userMetadata.publications`

`userName` понадобится для API-запросов.

### API routes

Routes уже заведены здесь:

- `src/shared/api/api-routes.ts`

Нужные routes:

- `API_ROUTES.USERS_FOLLOW.FOLLOWERS_BY_USERNAME(userName)`
- `API_ROUTES.USERS_FOLLOW.FOLLOWING_BY_USERNAME(userName)`

Они соответствуют backend endpoints:

```ts
GET / api / v1 / users / { userName } / followers
GET / api / v1 / users / { userName } / following
```

### Типы

Типы уже есть здесь:

- `src/shared/types/user/models.ts`

Нужные типы:

- `UserFollowingFollowersViewModel`
- `FollowingWithPaginationViewModel`

Ожидаемые поля пользователя в списке:

- `userId`
- `userName`
- `avatars`
- `createdAt`
- `isFollowing`
- `isFollowedBy`

### Где подсмотреть похожую реализацию

Список пользователей в поиске:

- `src/widgets/UserSearch/index.tsx`
- `src/widgets/UserSearch/UserSearch.module.css`

Что можно взять как пример:

- row layout;
- avatar + username;
- переход в профиль;
- empty state;
- error state;
- `InfiniteScrollTrigger`.

Modal:

- `src/shared/ui/Modal/Modal.tsx`

Infinite scroll:

- `src/shared/composites/InfiniteScrollTrigger/InfiniteScrollTrigger.tsx`

Переход в профиль:

- `src/shared/constant/app-routes.ts`

Скорее всего, для строки пользователя подойдет:

```ts
APP_ROUTES.PROFILE.ID(user.userId)
```

## План реализации

### 1. Добавить API queries для списков

Файл:

- `src/entities/users/api/publicUsers.api.ts`

Добавить два query:

- `getFollowersByUserName`
- `getFollowingByUserName`

Примерная форма аргументов:

```ts
type FollowListRequest = {
  userName: string
  pageSize?: number
  cursor?: number
}
```

Почему `cursor`:

- в проекте уже используется cursor pagination;
- в типе ответа есть `nextCursor`;
- `UserSearch` работает похожим образом.

Return type:

```ts
FollowingWithPaginationViewModel
```

После добавления endpoints экспортировать hooks из:

- `src/entities/users/api/index.ts`

Ожидаемые hooks:

- `useLazyGetFollowersByUserNameQuery`
- `useLazyGetFollowingByUserNameQuery`

Почему лучше lazy queries:

- списки не нужны сразу при открытии профиля;
- запрос должен уходить только когда пользователь открыл модалку;
- так профиль не делает лишние network requests.

### 2. Сделать `ProfileStats` интерактивным

Файл:

- `src/entities/profile/ui/Profile/ProfileStats/ProfileStats.tsx`

Сейчас компонент принимает только:

```ts
type Props = {
  stats: UserMetadata
}
```

Нужно расширить props:

```ts
type ProfileStatsType = 'following' | 'followers'

type Props = {
  stats: UserMetadata
  onStatClick?: (type: ProfileStatsType) => void
}
```

`Following` и `Followers` рендерить как настоящие кнопки:

```tsx
<button type="button">
```

`Publications` оставить обычным элементом без клика.

Важно:

- визуально счетчики должны остаться почти такими же;
- нужна нормальная клавиатурная доступность;
- нужно добавить `cursor: pointer`;
- нужно добавить `:focus-visible`;
- не превращать весь блок профиля в ссылку.

### 3. Хранить состояние модалки в `Profile`

Файл:

- `src/entities/profile/ui/Profile/Profile.tsx`

Почему здесь:

- `Profile` уже является client component;
- `Profile` уже получает актуальный `profile` из `useProfile`;
- здесь удобно держать UI-state открытой модалки;
- так `ProfileInfo` остается почти презентационным компонентом;
- мы не добавляем лишний client boundary внутрь profile header.

Добавить state:

```ts
type FollowListMode = 'following' | 'followers' | null
```

Примерная идея:

```tsx
const [followListMode, setFollowListMode] = useState<FollowListMode>(null)
```

Передать callback в `ProfileInfo`, а дальше из `ProfileInfo` в `ProfileStats`:

```tsx
<ProfileInfo
  ...
  onStatClick={setFollowListMode}
/>
```

В `ProfileInfo` не хранить `followListMode`.

`ProfileInfo` только прокидывает callback:

```tsx
<ProfileStats stats={userMetadata} onStatClick={setFollowListMode} />
```

Модалку рендерить в `Profile`, рядом с основным profile layout:

```tsx
<FollowListModal
  open={followListMode !== null}
  mode={followListMode}
  userName={profile.userName}
  onClose={() => setFollowListMode(null)}
/>
```

### 4. Создать `FollowListModal`

Рекомендуемое место:

- `src/entities/profile/ui/Profile/FollowListModal/FollowListModal.tsx`
- `src/entities/profile/ui/Profile/FollowListModal/FollowListModal.module.scss`
- `src/entities/profile/ui/Profile/FollowListModal/index.ts`

Задачи компонента:

- понять, какой список открыт: `followers` или `following`;
- выбрать правильный lazy query;
- загрузить первую страницу при открытии;
- хранить загруженных пользователей в локальном state;
- хранить `nextCursor`;
- догружать следующие страницы через `InfiniteScrollTrigger`;
- показывать loading, empty и error states;
- закрываться при переходе в профиль пользователя.

Константа:

```ts
const PAGE_SIZE = 10
```

Почему `10`:

- это достаточно маленькая страница для модалки;
- удобно проверить догрузку: если following/followers больше 10, следующий пользователь попадет на следующую страницу;
- список не выглядит слишком тяжелым при первом открытии.

Заголовки модалки:

- `Followers`
- `Following`

### 5. Собрать UI списка

Каждая строка пользователя:

- avatar;
- username;
- optional full name, если backend его отдаст;
- ссылка на профиль.

Использовать существующие компоненты:

- `Avatar` из `src/shared/composites/Avatar`;
- `Typography` из `src/shared/ui`;
- `Modal` из `src/shared/ui`;
- `InfiniteScrollTrigger` из `src/shared/composites`;
- `Link` из `next/link`.

На первом этапе не добавлять:

- кнопку `Follow / Unfollow` внутри модалки;
- search input внутри модалки;
- отдельную страницу;
- новый пункт в sidebar.

Почему:

- Jira-задача про просмотр списков;
- follow/unfollow внутри списка потянет дополнительную синхронизацию счетчиков;
- существующие UC уже покрывают follow/unfollow в профиле и feed.

### 6. Обработать состояния

Нужно обязательно:

- initial loading — список еще грузится;
- loading more — догружается следующая страница;
- empty state — список пустой;
- error state — запрос упал.

Тексты можно сделать простыми:

```text
No followers yet
No following yet
Failed to load users. Please try again.
```

Опционально:

- кнопка `Retry`, если первая загрузка упала.

### 7. Тесты

Достаточно сфокусированных тестов.

Рекомендуемые файлы:

- `src/entities/profile/ui/Profile/ProfileStats/ProfileStats.test.tsx`
- `src/entities/profile/ui/Profile/FollowListModal/FollowListModal.test.tsx`

Что проверить в `ProfileStats`:

- рендерятся все три счетчика;
- клик по `Following` вызывает `onStatClick('following')`;
- клик по `Followers` вызывает `onStatClick('followers')`;
- `Publications` не вызывает callback.

Что проверить в `FollowListModal`:

- для режима `followers` показывается title `Followers`;
- для режима `following` показывается title `Following`;
- пользователи из ответа отображаются в списке;
- при пустом ответе показывается empty state;
- при ошибке показывается error state;
- при клике на пользователя вызывается `onClose`.

Широкий integration test делать не обязательно, если реализация останется маленькой.

### 8. Ручная проверка

Запустить проект:

```bash
pnpm dev
```

Проверить:

- открыть свой профиль;
- нажать `Following`;
- закрыть модалку;
- нажать `Followers`;
- перейти в профиль пользователя из модалки;
- проверить профиль другого пользователя;
- убедиться, что `Publications` не кликается;
- если найдется профиль без followers/following, проверить empty state;
- если найдется профиль с большим списком, проверить infinite scroll.

### 9. Автоматические проверки

Запустить:

```bash
pnpm typecheck
pnpm lint
pnpm test:run src/entities/profile src/entities/users
```

Важно:

- `pnpm test` в этом проекте сейчас placeholder;
- для Vitest использовать `pnpm test:run ...`.

## Git hygiene

Текущая ветка:

```bash
SCRUM-308-UC-6-followers-following
```

Есть старый unrelated untracked файл:

```bash
SCRUM-306-image-messages-roadmap.md
```

Не добавлять его в SCRUM-308.

Лучше не использовать:

```bash
git add .
```

Добавлять файлы точечно:

```bash
git add src/entities/profile/... src/entities/users/...
```

Roadmap-файл тоже не обязательно коммитить. Он может оставаться личной рабочей подсказкой.

## Возможный commit message

Если фича получится компактной:

```bash
git commit -m "SCRUM-308 add followers and following profile lists"
```

Если разрастется, можно разделить:

1. API hooks and types.
2. Profile stats modal UI.
3. Tests.

## Чему здесь стоит научиться

Эта задача хорошая, потому что она проходит через небольшой вертикальный срез приложения:

- RTK Query endpoint;
- существующий profile UI;
- локальное modal state;
- paginated list rendering;
- доступные интерактивные элементы;
- focused tests.

Главный навык в этой задаче — аккуратность: не создавать новый раздел приложения, когда достаточно оживить уже существующую статистику профиля.
