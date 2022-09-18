import type MergeRule from "./merge-rule.js";

export type MergeRules<T extends object> = { [K in keyof T]?: MergeRule<T[K]> };

export default MergeRules;