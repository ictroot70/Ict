# PR Review Playbook

## Steps
1. Проверить границы и размещение по FSD.
2. Проверить разделение UI/model/api.
3. Проверить App Router и Server vs Client решения.
4. Проверить type-safety и отсутствие скрытого техдолга.
5. Проверить фактические quality-gates из `../quality-gates.md`.

## Checklist
- Нет бизнес-логики в UI.
- Нет нарушений dependency direction.
- Нет новых запрещённых паттернов.
- Приложены результаты проверок.

## PR evidence
- Список найденных проблем (major/minor).
- Запущенные команды (`pnpm run ci:check` или эквивалентный состав).
- Вердикт: Approve / Request Changes.

## References
- `../policy.md`
- `../quality-gates.md`
- `../anti-patterns.md`
