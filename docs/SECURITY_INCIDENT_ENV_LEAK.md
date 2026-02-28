# Security Incident: `.env*` tracked in git history

## Summary
Environment files were present in git history. Treat all secrets from these files as compromised.

## Mandatory actions
1. Rotate all affected secrets immediately.
2. Revoke old credentials/tokens.
3. Update secrets in CI/CD and hosting.
4. Rewrite git history to remove `.env*` from all refs.
5. Require team re-clone after history rewrite.

## Tracking
- Owner:
- Rotated at:
- Affected systems:
- Verification status:

