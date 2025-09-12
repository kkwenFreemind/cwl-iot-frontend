# Phase 1 — Remove Unnecessary Features for Community Water Level IoT

**Date**: 2025-09-12

## Objective

This phase aims to remove unnecessary features and demo pages from the project, making the codebase more streamlined, reducing interference during review and deployment, and ensuring the system can still start and compile normally.

## Scope (This Phase)

- Remove `codegen` functionality (views, API, enums, mock)
- Remove all demo pages and related files from `src/views/demo`
- Clean up menu items in `mock/menu.mock.ts` that point to deleted components
- Check and simplify route generation logic to avoid referencing deleted demo components
- Verify that the development server can start and perform basic validation

## Completed Progress

- Removed codegen-related files:
  - `src/enums/codegen/*` (deleted)
  - `src/api/codegen-api.ts` (deleted)
  - `src/views/codegen/index.vue` (deleted)
  - Corresponding mock/menu items removed
- Deleted demo pages and files: All example files under the entire `src/views/demo/` directory have been removed
- Cleaned up `mock/menu.mock.ts`, removing all component strings pointing to `demo/...` and corresponding menu nodes
- Removed demo-filter guard in `src/store/modules/permission-store.ts` (kept explanatory comment)
- Related changes have been committed & pushed to remote `master`:
  - `911a478` — chore: remove demo views
  - `fd1ee08` — chore: remove demo menu entries from mock
  - `42b6193` — chore: clean demo comments & simplify permission route parsing

## Verification

- Repository-wide search shows no remaining valid `demo/...` component references (only comment text remains)
- Vite development server can start successfully (auto-switches to port 3001 if 3000 is in use), no import/startup errors observed during startup

## Next Steps (Recommended)

1. Execute production build to ensure no build-time errors:

   ```powershell
   pnpm install
   pnpm build
   ```

2. Run lint and type-check:

   ```powershell
   pnpm lint
   pnpm typecheck
   ```

3. (Optional) Remove remaining empty directories or clean up excess translation/documentation text

4. When Phase 1 validation is complete, plan Phase 2 (add features required for Community Water Level IoT, such as: telemetry dashboard, device list, map view, etc.)

## Notes

- All commits use English messages to meet international review requirements
- Pre-commit hooks (lint-staged / ESLint / Prettier) were triggered during submission and automatically fixed handleable formatting issues

---

**Status**: Phase 1 cleanup completed. Ready for validation (`pnpm build` & `pnpm lint`) or Phase 2 planning.
