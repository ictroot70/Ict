# Feature Playbook

## Steps
1. Уточнить цель фичи и границы ответственности.
2. Определить размещение по FSD.
3. Разделить model/api/ui перед реализацией.
4. Проверить Server vs Client decision для каждого entrypoint.
5. Сверить решение с `../policy.md` и `../quality-gates.md`.

## Checklist
- Границы фичи зафиксированы.
- UI остаётся presentation-only.
- Data-flow и ownership понятны.
- Нет нарушения dependency direction.

## PR evidence
- Краткое архитектурное обоснование.
- Какие gate-команды запускались.
- Какие риски/компромиссы приняты.

## References
- `../policy.md`
- `../quality-gates.md`
- `../anti-patterns.md`
