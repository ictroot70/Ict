## Summary

- Jira:
- What changed:

## Scope

### In scope

-

### Out of scope

-

## Architecture impact

- [ ] No architectural boundaries changed
- [ ] Architectural change (requires policy update)

If architectural change is checked:

- add label `policy-change`
- fill `Contract change` section
- update `.ai/policy.md` version metadata

## Contract change

- What changed:
- Why:
- Impact/Migration:
- Policy version updated:

## Mandatory checklist

- [ ] `pnpm run ci:check` is green
- [ ] For refactor/optimization/auth-flow changes: `pnpm run verify:full` is green
- [ ] No new `any` in production code
- [ ] Manual verification scenarios are listed
- [ ] Risks and rollback strategy are documented

## Verification evidence

### Automated

- Commands and result:
- `Product contract impact`:
- `Full-check evidence`:

### Manual

- Scenario 1:
- Scenario 2:

## Risks and Rollback

- Risks:
- Rollback plan:
