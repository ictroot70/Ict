# Чеклист v2: приоритеты + подробный план фиксов по ТЗ

Дата старта: \***\*\_\_\*\***  
Ветка: `SCRUM-119-User-Profile-Management`  
Ответственный: \***\*\_\_\*\***  
Статус: `IN_PROGRESS / BLOCKED / DONE`

## 0) Как работать с этим планом

- Идём сверху вниз: сначала `P0`, потом `P1`, затем `P2`.
- Не раздуваем код: сначала правки в текущих файлах, новые файлы только при реальной необходимости.
- После каждого подэтапа отмечайте чекбоксы и пишите заметки.

## 1) Приоритеты (коротко)

## P0 (обязательно до merge)

- [ ] Owner-only доступ к `/profile/[id]/settings/*` без расхождения URL/поведения
- [ ] Явный error-state + retry на странице `General Information`
- [ ] Сохранение draft формы при переходе в Privacy Policy и возврате
- [ ] Единый текст ошибки загрузки фото строго по ТЗ
- [ ] Микрофикс success-alert (`Your settings are saved!` без ведущего пробела)

## P1 (желательно в этой же ветке)

- [ ] Полный ручной smoke по UC-1 / UC-2 / UC-3
- [ ] Короткие notes по решениям (что и почему)
- [ ] Проверка UX-кромок (cancel upload, retry, invalid file, back from Privacy)

## P2 (можно вынести в follow-up)

- [ ] Лёгкая уборка технического долга, не меняющая поведение
- [ ] Небольшие улучшения читаемости без роста сложности

---

## 2) Детальный план по шагам (с примерами)

## Шаг A (P0): Owner-only логика в settings

Цель: редактировать профиль может только владелец, URL и фактическое поведение совпадают.

Файлы (основные):

- `src/app/profile/[id]/settings/layout.tsx`
- `src/features/profile/edit-profile/hooks/useProfileManagement.ts`

Чеклист:

- [ ] Проверить сценарии: свой `id`, чужой `id`, неавторизованный пользователь
- [ ] Добавить блокирующую проверку в layout до рендера children
- [ ] При чужом `id` делать redirect на `/profile/{myId}/settings/general`
- [ ] Убедиться, что не происходит «вспышки» чужой страницы

Пример (идея, до 30 строк):

```tsx
const requestedId = Number(idFromRoute)
const myId = user?.userId

if (isLoadingAuth) return <Loading />
if (!isAuthenticated || !myId) {
  router.replace(`/auth/login?from=${encodeURIComponent(pathname)}`)
  return null
}
if (requestedId !== myId) {
  router.replace(`/profile/${myId}/settings/general`)
  return null
}
```

Критерий готовности:

- [ ] Открытие `/profile/anotherId/settings/general` всегда переводит на свой settings

Заметки этапа:

---

---

## Шаг B (P0): Error-state вместо вечного skeleton

Цель: при ошибке API пользователь видит понятный экран с кнопкой повторной загрузки.

Файлы:

- `src/features/profile/edit-profile/ui/GeneralSettings/GeneralSettings.tsx`

Чеклист:

- [ ] Учесть ошибки профиля (`profileError`) и стран/городов
- [ ] Добавить понятный текст ошибки и кнопку `Retry`
- [ ] `Retry` должен вызывать `refetchProfile` и повтор запроса стран
- [ ] Проверить, что skeleton не зацикливается при ошибке

Пример (идея, до 30 строк):

```tsx
const hasProfileError = Boolean(profileError)
const hasCountriesError = Boolean(countriesError)
const hasError = hasProfileError || hasCountriesError

if (hasError) {
  return (
    <ErrorState
      title="Failed to load profile settings"
      onRetry={() => {
        refetchProfile()
        refetchCountries()
      }}
    />
  )
}
```

Критерий готовности:

- [ ] При сетевой/серверной ошибке есть видимый error-state и рабочий retry

Заметки этапа:

---

---

## Шаг C (P0): Единый текст ошибки загрузки фото

Цель: сообщение строго по ТЗ для размера/формата.

Файл:

- `src/features/profile/avatar-upload/model/useAvatarUpload.ts`

Чеклист:

- [ ] Для `file-too-large` и `file-invalid-type` использовать один текст:
      `The photo must be less than 10 Mb and have JPEG or PNG format`
- [ ] Проверить оба сценария вручную

Критерий готовности:

- [ ] В обоих кейсах отображается ровно текст из ТЗ

Заметки этапа:

---

---

## Шаг D (P0): Draft формы при переходе в Privacy Policy

Цель: данные формы не теряются в сценарии `<13 -> Privacy Policy -> Back`.

Файлы (минимально):

- `src/features/profile/edit-profile/ui/GeneralSettings/GeneralSettings.tsx`
- `src/features/profile/edit-profile/ui/ProfileForm/ProfileForm.tsx`
- `src/features/legal/AgePolicyError.tsx`
- `src/features/legal/PrivacyOfPolicy.tsx`
- `src/features/profile/edit-profile/model/submitProfileUpdate.thunk.ts`

Рекомендация по простому решению:

- `sessionStorage` + один ключ draft
- сохранять draft перед переходом в Privacy
- восстанавливать draft при монтировании settings
- очищать draft после успешного save

Чеклист:

- [ ] Добавить `DRAFT_KEY` и маленькие helper-функции чтения/записи
- [ ] На клике по Privacy link сохранять текущие values формы
- [ ] На загрузке settings восстанавливать values, если draft существует
- [ ] После успешного сохранения очищать draft
- [ ] Проверить ручной сценарий полностью

Пример (идея, до 30 строк):

```ts
const DRAFT_KEY = 'profile-settings-general-draft'

function saveDraft(values: EditProfileFormValues) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values))
}
function readDraft(): EditProfileFormValues | null {
  const raw = sessionStorage.getItem(DRAFT_KEY)
  return raw ? JSON.parse(raw) : null
}
function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY)
}
```

Критерий готовности:

- [ ] После возврата из Privacy все введённые данные на месте

Заметки этапа:

---

---

## Шаг E (P0): Success-alert micro fix

Цель: визуальная точность по ТЗ.

Файл:

- `src/features/profile/edit-profile/model/submitProfileUpdate.thunk.ts`

Чеклист:

- [ ] Заменить `' Your settings are saved!'` на `'Your settings are saved!'`
- [ ] Ручная проверка успешного save

Критерий готовности:

- [ ] Сообщение без лишнего пробела

Заметки этапа:

---

---

---

## 3) Рекомендованная последовательность по дням

## День 1

- [ ] Шаг A (owner-only)
- [ ] Шаг B (error-state)
- [ ] Прогон проверок

## День 2

- [ ] Шаг C (avatar error text)
- [ ] Шаг D (draft restore)
- [ ] Прогон проверок

## День 3

- [ ] Шаг E (alert micro fix)
- [ ] Полный smoke UC-1/UC-2/UC-3
- [ ] Финальные проверки и подготовка к merge

---

## 4) Обязательные проверки после каждого этапа

- [ ] `pnpm run lint`
- [ ] `pnpm run format:check`
- [ ] `pnpm run type-check`
- [ ] `pnpm run build`

Лог проверок:

---

---

---

---

## 5) Финальный smoke-check (по ТЗ)

## UC-1 (Заполнение/редактирование)

- [ ] Owner-only доступ к settings соблюдён
- [ ] Обязательные поля валидируются
- [ ] Кнопка `Save Changes` неактивна при невалидной форме
- [ ] `<13` показывает сообщение и переход в Privacy Policy
- [ ] Возврат из Privacy сохраняет draft
- [ ] Успех/ошибка сохранения показывают корректные алерты

## UC-2 (Загрузка/удаление фото)

- [ ] Upload JPEG/PNG работает
- [ ] Лимит 10 MB работает
- [ ] Ошибка невалидного файла = текст из ТЗ
- [ ] Cancel upload не сохраняет фото
- [ ] Delete confirm (`Yes/No`) работает корректно

## UC-3 (Редактирование данных)

- [ ] Переход из профиля в settings работает
- [ ] Изменения сохраняются и остаются на странице редактирования
- [ ] Выход без сохранения не применяет несохранённые изменения

Итог:

- [ ] Готово к merge
- [ ] Нужны доработки

Финальные комментарии:

---

---

---
