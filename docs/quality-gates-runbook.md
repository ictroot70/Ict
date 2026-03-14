# Quality Gates Runbook

Короткая инструкция для ручного запуска проверок и интерпретации результата.

Подробный пошаговый flow по сценариям:

- [`docs/developer-check-sequence.md`](docs/developer-check-sequence.md)

## Кто запускает проверки

- Локально проверки запускает разработчик вручную.
- В CI проверки запускаются только если pipeline явно вызывает нужные команды.
- Агент (Codex) не запускает их «сам по себе» в фоне; он запускает проверки только по вашей явной задаче.
- В текущем репозитории GitHub Actions сейчас покрывает только `secret-scan`, поэтому `verify:smart`/`verify:full` по умолчанию локально-ручные (или в вашем внешнем CI).

## One-time setup

```bash
pnpm install
pnpm run playwright:install
pnpm run hooks:install
```

`playwright:install` скачивает браузеры для smoke-check (`chromium`, `firefox`, `webkit`).
`hooks:install` настраивает локальный `core.hooksPath=.githooks`.

После этого проверки запускаются автоматически:

- `pre-commit` -> `pnpm run verify:precommit` (быстрый gate)
- `pre-push` -> `pnpm run verify:auto` (умный выбор smart/full + reuse stamp)

## Что запускать и когда

- Базовый обязательный контракт: `pnpm run ci:check`
- Для PR/feature-веток: `pnpm run verify:smart`
- Для `develop` (merge/integration): `pnpm run verify:full`
- Автоматический выбор команды: `pnpm run verify:auto`

`verify:auto` сам выбирает, что запускать:

- `develop` -> `verify:full`
- PR/feature-ветка -> `verify:smart`
- нет изменений относительно `VERIFY_SMART_BASE_REF` -> skip
- если текущий `HEAD` уже успешно проверен и stamp валиден -> reuse (без повторного прогона)
- в `pre-push` при наличии remote/local SHA используется фактический push-range для smart-detector

## Как работает verify:smart

1. Всегда запускает `ci:check`.
2. Запускает `detect-impact` (по умолчанию база `origin/develop`, либо explicit range от `pre-push`).
3. Если решение `skip_full`, pipeline завершается успешно без `verify:full`.
4. Если решение `run_full`, автоматически запускается `verify:full`.
5. Fail-safe: при uncertainty решение всегда `run_full`.
6. После успешного прогона записывается verification stamp в `.git/codex/verification-stamp.json`.

## Полезные env-переменные

- `APP_BASE_URL` (default: `http://localhost:3000`)
- `PERF_BUDGET_PROFILE_ROUTE` (default: `/profile/1`)
- `VERIFY_SMART_BASE_REF` (default: `origin/develop`)
- `VERIFY_SMART_FORCE_FULL=1` (аварийно принудить полный прогон)
- `VERIFY_AUTO_DRY_RUN=1` (только показать решение `verify:auto`, без запуска команд)
- `VERIFY_AUTO_IGNORE_STAMP=1` (игнорировать локальный verification stamp)
- `VERIFY_AUTO_LOCAL_SHA` / `VERIFY_AUTO_REMOTE_SHA` (служебные подсказки range от `pre-push`)
- `VERIFY_SMART_DIFF_FROM` / `VERIFY_SMART_DIFF_TO` (служебный explicit range для `detect-impact`)
- `SKIP_PRE_COMMIT=1` (разово пропустить `pre-commit`)
- `SKIP_PRE_PUSH=1` (разово пропустить `pre-push`)

## Быстрые команды для проверки логики smart-gate

Проверить только детектор:

```bash
pnpm run detect:impact
```

Проверить детектор относительно текущего `HEAD` (удобно для sanity-check на локальных точечных изменениях):

```bash
VERIFY_SMART_BASE_REF=HEAD pnpm run detect:impact
```

## PR message snippets (for template)

Используйте в секции `## Verification evidence -> Automated`:

- `Product contract impact`:

```text
Product contract impact:
- contract file: unchanged
- locked behaviors: unchanged
- contract tests: unchanged and green (`pnpm run test:contracts`)
```

- `Smart impact decision`:

```text
Smart impact decision:
- gate: verify:smart
- decision: run_full | skip_full
- reason: <detector reason from summary JSON>
- baseRef: origin/develop
```

- `Full-check evidence`:

```text
Full-check evidence:
- verify:full: passed | skipped
- e2e smoke (chromium/firefox/webkit): passed
- perf budgets (`/` and `/profile/1`): passed
```
