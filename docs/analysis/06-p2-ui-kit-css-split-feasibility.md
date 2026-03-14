# P2: UI-kit CSS Split Feasibility

Дата: 2026-03-14
Статус: `NOT_FEASIBLE (consumer-only)`

## 1) Контекст задачи

Цель: проверить, можно ли снизить `unused CSS` для `@ictroot/ui-kit` в текущем приложении без изменений в самом `ui-kit` пакете.

AC задачи:
- Есть техническое заключение `feasible / not-feasible`.
- При провале оформлен отдельный backlog с next step.

## 2) Обязательная проверка quality-gates

Перед анализом выполнен контрактный gate:
- `pnpm run ci:check` -> `PASS` (есть предупреждения lint, ошибок нет).

## 3) Факты

1. Глобальный импорт `ui-kit` стилей сделан в root-уровне:
   - `src/app/globals.css` -> `@import '@ictroot/ui-kit/style.css';`
2. Пакет `@ictroot/ui-kit@2.0.0-beta.1` экспортирует только один публичный CSS entrypoint:
   - `./style.css` -> `./dist/ui-kit.css`
   - Публичных `./*.css` subpath-ов по компонентам нет.
3. В build-манифесте root layout всегда тянет CSS chunk `static/css/e106934aff6a1bee.css`:
   - это делает слой `ui-kit` стилей always-loaded для всех роутов.
4. Размеры:
   - `node_modules/@ictroot/ui-kit/dist/ui-kit.css` -> `38520` bytes.
   - `.next/static/css/e106934aff6a1bee.css` -> `54459` bytes.
5. Оценка внутреннего состава `ui-kit.css` (локальный разбор правил):
   - блок DatePicker (`.rdp-*` + scoped rules) ~ `13092` bytes (~34% файла).
6. DatePicker используется точечно:
   - в `ProfileForm` (`date_of_birth`) через `ControlledDatePickerSingle`,
   - не является базовым элементом всех страниц.

## 4) Техническое заключение

`NOT_FEASIBLE` для надёжного CSS split только на стороне приложения.

Причина:
- текущий контракт пакета предоставляет монолитный `style.css`;
- без новых CSS entrypoint-ов в `ui-kit` придётся копировать/резать хешированные селекторы вручную;
- такой подход ломкий при любом обновлении `ui-kit` и создаёт высокий риск регрессий.

## 5) Отдельный backlog (next step)

ID: `BL-UIKIT-CSS-SPLIT-001`  
Тип: `follow-up / external dependency`  
Приоритет: `P2`  
Статус: `OPEN`

### Задача

Добавить в `@ictroot/ui-kit` поддерживаемое разделение CSS на публичные entrypoint-ы:
- `@ictroot/ui-kit/style.css` (legacy, обратная совместимость),
- `@ictroot/ui-kit/core.css`,
- `@ictroot/ui-kit/datepicker.css`,
- `@ictroot/ui-kit/modal.css`,
- `@ictroot/ui-kit/toast.css`,
- `@ictroot/ui-kit/recaptcha.css`.

### Definition of Done

1. В `exports` пакета есть перечисленные CSS subpath-ы.
2. Документация `ui-kit` описывает схему подключения для Next.js App Router.
3. В нашем приложении можно оставить `core.css` в root layout и перенести feature CSS в соответствующие route/layout сегменты.
4. После миграции подтверждено снижение CSS на стартовых страницах (через perf-baseline).

### Следующий шаг

Создать issue/PR в репозитории `ui-kit` с изменением export-контракта CSS, затем выполнить consumer-макет миграции в текущем проекте.
