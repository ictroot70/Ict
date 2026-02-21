# Contributing

## Mandatory PR gates
- PR cannot be merged if `pnpm run ci:check` is not green.
- Disabling or bypassing lint/typecheck/build gates without approved exception is prohibited.

## No silent deviation (hard rule)
Any implementation that deviates from `.ai/policy.md` is treated as an architecture defect, even if CI is green.

## Mandatory PR checklist
- [ ] Architecture boundaries are preserved (FSD + presentation-only UI)
- [ ] No new `any` introduced in production code
- [ ] Critical manual scenarios are verified and listed in PR
- [ ] Risks and trade-offs are explicitly documented
- [ ] `pnpm run ci:check` result is attached

## Architecture and policy changes
If architectural contract changes:
- add PR label: `policy-change`
- include section: `Contract change`
- explain what changed, why, migration/impact
- update policy version metadata in `.ai/policy.md`

## Code review expectations
Use severity levels:
- Blocker
- Major
- Minor
- Nit

Review findings must include:
- file/location reference
- reproducible steps or logs for behavioral issues

## Security and commit hygiene
Do not commit:
- secrets, tokens, credentials
- `.env*` files except `.env.example`
- local IDE/AI configs (`.cursor/` and similar)
- private local reports/artifacts

## Infrastructure constraints (educational project)
- DevOps configuration and `Jenkinsfile` are treated as external/read-only unless the DevOps owner explicitly requests changes.
- If Jenkins gates differ from repository local gates, document this in PR as an external constraint.
- Frontend team baseline remains: `pnpm run ci:check` (or equivalent local gate set from `.ai/quality-gates.md`).
