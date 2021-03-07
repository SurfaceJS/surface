import type MergeRule from "./merge-rule";

export type MergeRules<T extends object> = { [K in keyof T]?: MergeRule<T[K]> };

export default MergeRules;