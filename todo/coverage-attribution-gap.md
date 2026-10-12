# Technical Debt: c8 coverage attribution gap in the `@suite` decorator test path

- **Type:** Infrastructure / test tooling
- **Area:** `@surface/test-suite` + `@surface/mock-loader` + c8 instrumentation
- **Severity:** Medium — does not affect test correctness, but coverage numbers under-report real execution, misleading quality baselines and any coverage-gated decisions.
- **Status:** Confirmed / reproducible

## Summary

When a test body runs through the `@suite` + `@shouldPass` decorator API, c8 (Node 26, `node --test` runner) **drops most of the line hits for code that is actually executed**. The same call written as a plain `node:test` `it()` block is attributed correctly. As a result, files exercised primarily via decorator-driven specs (e.g. `packages/path-matcher`) report far lower coverage than they genuinely achieve.

## Evidence (controlled experiment)

Single file, identical logic, only the test style differs:

| Test style | File being measured | Reported by c8 |
|---|---|---|
| Plain `node:test` `it()` constructing `PathMatcher` | `packages/path-matcher/internal/path-matcher.ts` | **91 / 131 = 69.5%** |
| Identical calls inside a `@suite` spec method | same file | **54 / 131 = 41.2%** |

In the combined run (both styles in one file), the constructor lines got exactly **1 hit** each (L28/29/54) — confirming the decorator-path constructor **did execute** but its hits are not attributed to the measured lines. Both styles pass (no fake assertions, so a proxy cannot mask execution).

## Root-cause hypothesis (not yet disproven)

`tasks/loader-register.mjs` registers `@surface/mock-loader` for `--import`. Its `load()` hook, when a `?mock=` query param is present, **re-imports the target and re-exports it through a proxy module** (`packages/mock-loader/internal/create-proxy.js`). In the decorator path the spec's module graph goes through that proxy, so the `PathMatcher` the spec method binds to is likely a distinct module instance whose line counters are not the ones c8 maps onto `internal/path-matcher.ts`. Plain `node:test` probes that import the target directly hit the real file, hence higher coverage.

## Impact

1. Coverage baselines (`.nycrc.json`: statements 42 / lines 42) are **under-estimates**; real execution is higher.
2. Any "we need more coverage" decision based on these numbers is skewed.
3. Per-file reports (e.g. path-matcher `41.2%`) make a well-tested file look under-tested.

## Candidate fixes (ranked)

1. **Verify hypothesis:** run the same decorator spec without `--import=./tasks/loader-register.mjs` (or with mock-loader bypassed for that package) and confirm path-matcher jumps to ~69%.
2. **Attribute in the right graph:** ensure `@surface/test-suite` specs import the *same* module instance c8 instruments (avoid proxy re-export) — may require a mock-loader option to pass through real modules for `node:test` specs.
3. **Escape hatch per-spec:** for pure unit specs that don't need mocking, allow plain `node:test` `it()` blocks (accurate but deviates from the `@suite` convention).
4. **Instrument at the right layer:** confirm c8 reads the `internal/**/*.js` files directly and that source maps point back to the same absolute file for both paths.

## Verification checklist

- [ ] Reproduce: plain `it()` vs `@suite` method on same construct, compare c8 output.
- [ ] Re-run path-matcher instance spec **without** `loader-register` import; record the delta.
- [ ] Inspect `create-proxy.js` for module-identity side effects.
- [ ] Confirm fix does not break the existing `@mock` behavior in other packages.

## References

- Probe used: `packages/path-matcher/tests/path-matcher-instance.spec.ts` (new; all 11 pass; 1735/1735 green).
- Full-suite numbers after adding the spec: Statements 42.28%, Lines 42.28% (baseline holds) — the new tests do not move the needle *as measured*, consistent with the attribution gap.
- Relevant sources: `packages/mock-loader/internal/loader.js`, `packages/mock-loader/internal/create-proxy.js`, `packages/test-suite/internal/decorators.ts`, `tasks/loader-register.mjs`.
