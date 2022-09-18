/* eslint-disable @typescript-eslint/indent */
import type MergeRules from "./merge-rules.js";

type MergeRule<T> = ((a: T, b: T) => T) | "protected" |
    (
        T extends unknown[]
            ? "merge" | "append" | "prepend" | MergeRules<T> | (T[number] extends infer U ? U extends object ? "...merge" | MergeRules<U> : never : never)
            : T extends RegExp
                ? "match"
                : T extends object
                    ? "merge" | MergeRules<T>
                    : "match"
    );

export default MergeRule;
