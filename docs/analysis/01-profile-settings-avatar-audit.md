# Аудит ветки: профиль, настройки, редактирование, аватар

Дата: 2026-02-24  
Ветка: `SCRUM-119-User-Profile-Management`  
База сравнения: `f7aedae` (`origin/develop`)  
Коммитов в ветке: `35`  
Diff: `185 files changed, +6384 / -1251`

## 1. Срез качества (quality gates)

- Канонический контракт из AGENTS: `pnpm run ci:check`.
- Фактический результат: в `package.json` отсутствует script `ci:check` (контракт не соблюдён).
- Запущены фактические проверки:
  - `pnpm run lint` -> OK (есть warnings по `no-console` в `src/shared/lib/logger.ts`).
  - `pnpm run type-check` -> OK.
  - `pnpm run format:check` -> OK.
  - `pnpm run build` -> OK (есть warnings: `autoprefixer` в `CropStep.module.scss`, Next ESLint plugin warning).

## 2. Что уже сделано хорошо

- Ветка реально закрывает большой кусок фич профиля:
  - новая структура страниц настроек `src/app/profile/[id]/settings/**`;
  - модуль редактирования профиля `src/features/profile/edit-profile/**`;
  - модуль загрузки/кропа/удаления аватара `src/features/profile/avatar-upload/**`;
  - интеграция с API профиля (PUT profile, POST avatar, DELETE avatar).
- Валидация формы на `zod` настроена, включая возрастное ограничение.
- По аватару есть:
  - crop flow;
  - лимиты формата/размера;
  - camera capture;
  - корректная invalidation tags RTK Query (`profile`).
- Архитектурно вынесено много логики из `app` в `features` (в целом направление правильное).

## 3. Критичные/важные проблемы по целевому скоупу

### High 1: `id` в URL настроек не является источником истины

- Где:
  - `src/app/profile/[id]/settings/[tab]/page.tsx:12`
  - `src/features/profile/edit-profile/hooks/useProfileManagement.ts:17`
  - `src/features/profile/edit-profile/ui/EditProfile/TabsHeader/TabsHeader.tsx:35`
- Факт:
  - страница читается как `/profile/{id}/settings/...`;
  - но данные всегда берутся через `useGetMyProfileQuery()` и update идёт в `my profile`.
- Риск:
  - можно открыть `/profile/999/settings/general`, но редактировать фактически свой профиль;
  - несоответствие URL <-> данных, путаница в навигации и support-кейсы.
- Что исправить:
  - на уровне route/layout валидировать `id` против текущего userId и делать redirect на свой id;
  - либо убрать `id` из settings URL, если редактируется только own profile.

### High 2: нет явных error-state, возможен вечный skeleton

- Где:
  - `src/features/profile/edit-profile/ui/GeneralSettings/GeneralSettings.tsx:153`
  - `src/features/profile/edit-profile/hooks/useProfileManagement.ts:15`
  - `src/features/profile/edit-profile/ui/GeneralSettings/GeneralSettings.tsx:57`
- Факт:
  - рендер формы только при `profile && isDataLoaded && isInitialized`;
  - ошибки `profileError` и ошибки стран/городов не выводятся пользователю;
  - при падении API получаем бесконечный loading-экран.
- Что исправить:
  - добавить explicit error state + кнопку retry;
  - показывать разный текст для profile/countries failures.

### Medium 1: ошибки upload/delete аватара частично «немые»

- Где:
  - `src/features/profile/avatar-upload/model/useAvatarUpload.ts:65`
  - `src/features/profile/avatar-upload/ui/AvatarUpload/AvatarUpload.tsx:96`
  - `src/features/profile/avatar-upload/ui/UploadStep/UploadStep.tsx:58`
- Факт:
  - ошибка сохраняется в `state.error`;
  - визуально она показывается только на шаге `upload`;
  - на шагах `crop` и delete-confirm пользователь может не увидеть причину фейла.
- Что исправить:
  - унифицировать показ ошибок (toast/banner) во всех шагах;
  - отдельно выводить ошибку в delete-modal.

### Medium 2: невозможность очистить `date_of_birth`

- Где:
  - `src/features/formControls/dataPicker/ControlledDatePicker.tsx:25`
- Факт:
  - при `undefined` дата принудительно откатывается в `initialValue`;
  - пользователь не может явно удалить дату рождения из формы.
- Что исправить:
  - разрешить clear-сценарий (`onChange(undefined)` -> payload `dateOfBirth: null`);
  - покрыть тестом «было значение -> очистили -> успешно сохранилось».

### Medium 3: `region` насильно синхронизируется с кодом страны

- Где:
  - `src/features/profile/edit-profile/lib/syncLocationFields.ts:35`
  - `src/features/profile/edit-profile/model/useSyncLocation.ts:42`
- Факт:
  - в `region` ставится `country` (ISO2), отдельного ввода региона нет.
- Риск:
  - потенциально порча данных, если backend трактует `region` как штат/область, а не ISO страны.
- Что исправить:
  - подтвердить API-контракт;
  - если `region` не нужен, убрать поле из payload/модели формы.

### Medium 4: неочевидная семантика «очистки» optional полей

- Где:
  - `src/features/profile/edit-profile/lib/formDataMappers.ts:29`
- Факт:
  - пустые строки конвертируются в `undefined` и не уходят в payload;
  - в зависимости от API это может не очищать поле на backend.
- Что исправить:
  - зафиксировать контракт: clearing через `null`/`''`/omit;
  - привести mapper к контракту и добавить интеграционный тест.

### Medium 5: вкладки settings частично не реализованы

- Где:
  - `src/features/profile/settings/ui/Devices.tsx:1`
  - `src/features/profile/settings/ui/AccountManagement.tsx:1`
  - `src/features/profile/settings/ui/Payments.tsx:1`
- Факт:
  - 3 вкладки — заглушки.
- Риск:
  - UX/продуктовый долг, особенно если фича считается «готовой».

### Low 1: хардкод языка

- Где:
  - `src/features/profile/edit-profile/ui/GeneralSettings/GeneralSettings.tsx:31`
  - `src/features/profile/edit-profile/model/editProfileForm.listeners.ts:31`
- Факт:
  - локаль принудительно `'en'`.
- Риск:
  - не соответствует i18n-сценариям.

### Low 2: накоплен неиспользуемый код в модуле профиля

- Где:
  - `src/features/profile/edit-profile/model/useProfileFormData.ts`
  - `src/features/profile/edit-profile/model/useProfileFormInitialization.ts`
  - `src/features/profile/edit-profile/model/editProfile.slice.ts`
  - `src/features/profile/edit-profile/model/editProfileState.slice.ts`
  - `src/features/profile/avatar/model/useUserAvatar.ts`
  - `src/features/profile/avatar/ui/UserAvatar.tsx`
- Факт:
  - несколько файлов/срезов не подключены в runtime или целиком закомментированы.
- Риск:
  - удорожание поддержки и рефакторов.

## 4. Общий вердикт по целевым задачам

Текущая ветка закрывает **MVP-уровень** для редактирования профиля и работы с фото профиля, но в текущем виде это **не production-final** из-за:

- несогласованности URL/id и фактического редактируемого профиля;
- отсутствия полноценного error UX;
- незавершённости части settings-вкладок;
- неоднозначной семантики location/optional полей.

## 5. Рекомендуемый порядок доработок

1. Закрыть `id` consistency в settings маршрутах (route guard/redirect).
2. Добавить явные error-state + retry для profile/countries.
3. Устранить «немые» ошибки upload/delete аватара.
4. Починить clear сценарий даты рождения + тест.
5. Финализировать контракт `region` и очистку optional полей.
6. Либо реализовать, либо скрыть/feature-flag вкладки `devices/account/payments`.
7. Удалить/архивировать неиспользуемые slices/hooks.
