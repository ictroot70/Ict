# PR Review Playbook

## Steps

1. Проверить границы и размещение по FSD.
2. Проверить разделение UI/model/api.
3. Проверить App Router и Server vs Client решения.
4. Проверить type-safety и отсутствие скрытого техдолга.
5. Проверить фактические quality-gates из `../quality-gates.md`.
6. Проверить impact по `locked` требованиям из `../contracts/product-requirements-lock.json`.
7. Для PR/feature-веток проверить результат `pnpm run verify:smart`.
8. Если smart-gate выбрал `run_full`, проверить evidence `pnpm run verify:full`.

## Checklist

- Нет бизнес-логики в UI.
- Нет нарушений dependency direction.
- Нет новых запрещённых паттернов.
- Приложены результаты проверок.
- Приложены результаты `contract:check` и `test:contracts`.
- Для изменений `locked`-поведения есть секция `Product contract impact`.
- Есть секция `Smart impact decision`.
- При `run_full` есть evidence по `verify:full`.

## PR evidence

- Список найденных проблем (major/minor).
- Запущенные команды (`pnpm run ci:check` или эквивалентный состав).
- Вердикт: Approve / Request Changes.

## References

- `../policy.md`
- `../quality-gates.md`
- `../anti-patterns.md`
- `../contracts/product-requirements-lock.json`
