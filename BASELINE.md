# Baseline — removes-mock-loader

## Outcome
`@surface/mock-loader` fully removed. Module mocking now uses `Mock.module(specifier, options?)`
in `@surface/mock`, delegating to node:test's global `mock.module()` tracker. All consumer specs
(rwx, publisher, builder) migrated off `Mock.of(...)` / loader-injected proxies.

## Node version
- Works on **v20.20.2** and **v26.11.1** (developer default).
  - v18: `require(ESM)` fails for polyfill.js.
  - The old mock-loader broke on v24/v26 (`ERR_INVALID_RETURN_PROPERTY_VALUE: shortCircuit`);
    that package is now deleted, so only `--experimental-test-module-mocks` is required.

## Test command
```bash
npm run test
```
which expands to:
```bash
node --experimental-test-module-mocks --test --require=./tasks/polyfill.js \
  **/packages/*/tests/**/*.spec.js   # globstar enabled via bash -c in the npm script
```
`--experimental-test-module-mocks` is mandatory: without it `mock.module()` throws at runtime.

## Final result (mock-loader removed)
```
# tests 1731
# suites 174
# pass 1731
# fail 0
```
The 12-test delta vs the 1743 master baseline = 11 `.scn.js` scenario files (not matched by the
`*.spec.js` glob) + 1 `loader.spec.js` from the deleted mock-loader package. All previously-passing
`.spec.js` tests still pass; zero regressions.

## Key implementation facts
- `Mock.module` resolves **relative specifiers against the calling test file's directory**
  (via stack inspection), because node:test otherwise resolves them against `packages/mock/internal/`.
- `Mock.module` delegates to the global `node:test` `mock.module()` — no TestContext, no
  @surface/test-suite changes. Specs that never call it are unaffected.
- Migrated spec pattern:
  ```ts
  const existsSyncMock = Mock.callable<(p: string) => boolean>();
  Mock.module("fs", { namedExports: { existsSync: existsSyncMock.proxy } });
  ```

## Files changed
- `packages/mock/internal/mock.ts` — added `Mock.module` + relative-specifier resolution.
- `packages/mock/tsconfig.json` — extends `tsconfig.node.json` (adds `node` types).
- `packages/{rwx,publisher,builder}/tests/*.spec.ts` — migrated to `Mock.module`.
- `package.json` — test script: dropped `--import=loader-register`, added
  `--experimental-test-module-mocks` + `bash -c 'shopt -s globstar'`.
- `tasks/internal/commands.ts` — `cover()`/`test()`: same flag changes, loader var removed.
- `tsconfig.json` — removed `./packages/mock-loader` reference.
- `eslint.config.mjs` — removed `tasks/loader-register.mjs` ignore.
- `.vscode/launch.json` — Debug Test config: dropped loader import, added the flag.
- Deleted: `packages/mock-loader/`, `mock-loader.config.json`, `tasks/loader-register.mjs`.