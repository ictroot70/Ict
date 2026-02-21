# AGENTS.md

## Entry points
- Canonical rules: `.ai/policy.md`
- Quality gates: `.ai/quality-gates.md`
- Anti-patterns: `.ai/anti-patterns.md`
- Process playbooks: `.ai/playbooks/feature.md`, `.ai/playbooks/pr-review.md`, `.ai/playbooks/debug.md`, `.ai/playbooks/refactor.md`

## Execution order
1. Сначала проверить/восстановить quality-gates.
2. Затем выполнять архитектурные и кодовые изменения.

## Governance
- Новые архитектурные инварианты добавляются только в `.ai/policy.md`.
- Изменения policy выполняются только через PR с label `policy-change` и секцией `Contract change`.
- Канонический quality-gate контракт: `pnpm run ci:check`.

## Response format
- Architecture plan: `1. Summary` / `2. Analysis` / `3. Recommendation` / `4. Risks & Alternatives`.
- PR review: `## Summary` / `## Major issues` / `## Minor issues` / `## Suggestions` / `## Verdict (Approve / Request Changes)`.
- Implementation: готовый код + короткое пояснение.

## Language
- Основной язык коммуникации (ответы, объяснения, ревью): русский.
- Допускается английский для технических терминов, названий API/библиотек, идентификаторов кода и команд.
- Не переводить имена файлов, пути, символы, команды, кодовые идентификаторы и тексты ошибок.
